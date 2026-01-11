package com.DOAP.service;

import com.DOAP.entity.Content;
import com.DOAP.entity.enums.ContentStatus;
import com.DOAP.entity.enums.ContentType;
import com.DOAP.repository.ContentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.rekognition.model.ModerationLabel;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {

    private final S3Service s3Service;
    private final RekognitionService rekognitionService;
    private final ContentRepository contentRepository;

    @Value("${aws.s3.bucket.temp}")
    private String tempBucket;

    @Value("${aws.s3.bucket.approved}")
    private String approvedBucket;

    @Transactional
    public Content uploadAndValidateContent(MultipartFile file, Long uploaderId) throws IOException {

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";

        String key = UUID.randomUUID() + extension;
        ContentType contentType = determineContentType(originalFilename);

        // 1. Upload to TEMP bucket
        s3Service.uploadFile(tempBucket, key, file);
        log.info("Uploaded {} to temp bucket {}", key, tempBucket);

        try {
            // ===== AI VALIDATION START =====

            if (contentType == ContentType.IMAGE) {
                validateImage(tempBucket, key);
            } else if (contentType == ContentType.VIDEO) {
                validateVideo(tempBucket, key);
            } else {
                cleanupAndReject(key, "Unsupported content type");
            }

            // ===== AI VALIDATION PASSED =====

            // 3. Move to APPROVED bucket
            s3Service.copyFile(tempBucket, key, approvedBucket, key);
            s3Service.deleteFile(tempBucket, key);

            // 4. Save to DB
            String s3Url = s3Service.generateUrl(approvedBucket, key);

            Content content = Content.builder()
                    .s3Key(key)
                    .s3Url(s3Url)
                    .contentType(contentType)
                    .status(ContentStatus.APPROVED)
                    .uploaderId(uploaderId)
                    .validationDetails("Approved: Strict AI Validation Passed")
                    .build();

            return contentRepository.save(content);

        } catch (RuntimeException ex) {
            log.warn("Content rejected: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error during upload", ex);
            cleanupSilently(key);
            throw new RuntimeException("Upload failed due to server error");
        }
    }

    // ================= HELPER METHODS =================

    private void validateImage(String bucketName, String key) {
        // A. Adult / sexual / violence detection
        List<ModerationLabel> labels = rekognitionService.detectModerationLabels(bucketName, key);

        boolean explicitUnsafe = labels.stream().anyMatch(label -> label.confidence() >= 70 &&
                (label.name().toLowerCase().contains("nudity") ||
                        label.name().toLowerCase().contains("sexual") ||
                        label.name().toLowerCase().contains("violence") ||
                        label.name().toLowerCase().contains("suggestive")));

        if (explicitUnsafe) {
            cleanupAndReject(key, "Adult / sexual / violent content not allowed");
        }

        // B. Human detection using Labels
        List<software.amazon.awssdk.services.rekognition.model.Label> imageLabels = rekognitionService
                .detectLabels(bucketName, key);

        boolean containsHuman = imageLabels.stream().anyMatch(label -> label.confidence() >= 70 &&
                (label.name().equalsIgnoreCase("Person") ||
                        label.name().equalsIgnoreCase("Human") ||
                        label.name().equalsIgnoreCase("People") ||
                        label.name().equalsIgnoreCase("Face") ||
                        label.name().equalsIgnoreCase("Portrait") ||
                        label.name().equalsIgnoreCase("Selfie")));

        if (containsHuman) {
            cleanupAndReject(key, "Human images (selfies, people, portraits) are not allowed");
        }

        // C. Document detection using Labels
        boolean isDocument = imageLabels.stream().anyMatch(label -> label.confidence() >= 70 &&
                (label.name().equalsIgnoreCase("Document") ||
                        label.name().equalsIgnoreCase("Text") ||
                        label.name().equalsIgnoreCase("Page") ||
                        label.name().equalsIgnoreCase("Paper") ||
                        label.name().equalsIgnoreCase("Book") ||
                        label.name().equalsIgnoreCase("ID Cards")));

        if (isDocument) {
            cleanupAndReject(key, "Document or text-based images not allowed");
        }
    }

    private void validateVideo(String bucketName, String key) throws InterruptedException {
        log.info("Starting async video moderation for {}", key);

        // Start async moderation job
        String jobId = rekognitionService.startVideoModeration(bucketName, key);
        log.info("Video moderation job started: {}", jobId);

        // Wait for results (polls every 5 seconds, max 2 minutes)
        List<software.amazon.awssdk.services.rekognition.model.ContentModerationDetection> detections = rekognitionService
                .getVideoModerationResults(jobId);

        // Check for unsafe content in any frame
        boolean hasUnsafeContent = detections.stream()
                .anyMatch(detection -> detection.moderationLabel().confidence() >= 70 &&
                        (detection.moderationLabel().name().toLowerCase().contains("nudity") ||
                                detection.moderationLabel().name().toLowerCase().contains("sexual") ||
                                detection.moderationLabel().name().toLowerCase().contains("violence") ||
                                detection.moderationLabel().name().toLowerCase().contains("suggestive")));

        if (hasUnsafeContent) {
            cleanupAndReject(key, "Video contains adult / sexual / violent content");
        }

        log.info("Video validation passed for {}", key);
    }

    private void cleanupAndReject(String key, String reason) {
        cleanupSilently(key);
        throw new RuntimeException(reason);
    }

    private void cleanupSilently(String key) {
        try {
            s3Service.deleteFile(tempBucket, key);
        } catch (Exception e) {
            log.error("Failed to cleanup temp file {}", key, e);
        }
    }

    private ContentType determineContentType(String filename) {
        if (filename == null)
            return ContentType.IMAGE;

        String lower = filename.toLowerCase();
        if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi")) {
            return ContentType.VIDEO;
        }
        return ContentType.IMAGE;
    }
}
