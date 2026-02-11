package com.DOAP.service;

import com.DOAP.entity.Content;
import com.DOAP.entity.Payment;
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
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {

    private final S3Service s3Service;
    private final RekognitionService rekognitionService;
    private final ContentRepository contentRepository;
    private final com.DOAP.repository.AdVisionMetadataRepository adVisionMetadataRepository;
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
            // Small delay to ensure S3 consistency (rare but possible issue)
            Thread.sleep(1000);

            // ===== AI VALIDATION START =====
            String detectedLabels = "";
            String detectedText = "";
            String moderationResult = "";

            if (contentType == ContentType.IMAGE) {
                log.info("Validating image in bucket: {}, key: {}", tempBucket, key);
                String[] results = validateImageAndExtractMetadata(tempBucket, key);
                detectedLabels = results[0];
                moderationResult = results[1];
            } else if (contentType == ContentType.VIDEO) {
                log.info("Validating video in bucket: {}, key: {}", tempBucket, key);
                moderationResult = validateVideo(tempBucket, key);
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

            Content savedContent = contentRepository.save(content);

            // 5. Save AdVisionMetadata
            com.DOAP.entity.AdVisionMetadata metadata = com.DOAP.entity.AdVisionMetadata.builder()
                    .content(savedContent)
                    .detectedLabels(detectedLabels)
                    .detectedText(detectedText)
                    .moderationResult(moderationResult)
                    .confidenceScores("See individual fields")
                    .build();
            adVisionMetadataRepository.save(metadata);

            return savedContent;

        } catch (RuntimeException ex) {
            log.warn("Content rejected: {}", ex.getMessage());
            cleanupSilently(key);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error during upload", ex);
            cleanupSilently(key);
            throw new RuntimeException("Upload failed due to server error");
        }
    }

    // ================= HELPER METHODS =================

    private String[] validateImageAndExtractMetadata(String bucketName, String key) {
        // A. Adult / sexual / violence detection
        System.out.println("\n\n\n\n\n\n\n\n\n\n\n\nValidating image in bucket: " + bucketName + ", key: " + key);
        List<ModerationLabel> labels = rekognitionService.detectModerationLabels(bucketName, key);
        System.out.println("\n\n\n\n\n\n\n\n\n\n\n\nModeration labels: " + labels);
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

        // Extract metadata for storage
        String detectedLabels = imageLabels.stream()
                .filter(l -> l.confidence() >= 70)
                .map(l -> l.name() + "(" + String.format("%.1f", l.confidence()) + "%)")
                .reduce((a, b) -> a + ", " + b)
                .orElse("None");

        String moderationResult = labels.stream()
                .map(l -> l.name() + "(" + String.format("%.1f", l.confidence()) + "%)")
                .reduce((a, b) -> a + ", " + b)
                .orElse("Safe");

        return new String[] { detectedLabels, moderationResult };
    }

    private String validateVideo(String bucketName, String key) throws InterruptedException {
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

        // Return moderation summary
        String moderationSummary = detections.stream()
                .map(d -> d.moderationLabel().name() + "(" + String.format("%.1f", d.moderationLabel().confidence())
                        + "%)")
                .distinct()
                .reduce((a, b) -> a + ", " + b)
                .orElse("Safe");

        return moderationSummary;
    }

    private final com.DOAP.repository.BookingRepository bookingRepository;
    private final com.DOAP.repository.PaymentRepository paymentRepository;
    private final com.DOAP.repository.AdBusinessDetailsRepository adBusinessDetailsRepository;

    @Transactional
    public void deleteContent(Long contentId, Long userId) {
        // Log to debug
        log.info("Deleting content {} for user {}", contentId, userId);

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        if (!content.getUploaderId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this content");
        }

        // 1. Delete AdVisionMetadata
        adVisionMetadataRepository.findByContent_Id(contentId).ifPresent(metadata -> {
            adVisionMetadataRepository.delete(metadata);
            log.info("Deleted AdVisionMetadata for content {}", contentId);
        });

        // 2. Delete AdBusinessDetails
        adBusinessDetailsRepository.findByContent_Id(contentId).ifPresent(details -> {
            adBusinessDetailsRepository.delete(details);
            log.info("Deleted AdBusinessDetails for content {}", contentId);
        });

        // 3. Delete Bookings and Payments
        List<com.DOAP.entity.Booking> bookings = bookingRepository.findByContentId(contentId);
        for (com.DOAP.entity.Booking booking : bookings) {
            // Delete associated payments
            List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
            if (!payments.isEmpty()) {
                paymentRepository.deleteAll(payments);
                log.info("Deleted {} payments for booking {}", payments.size(), booking.getId());
            }
            // Delete booking
            bookingRepository.delete(booking);
            log.info("Deleted booking {}", booking.getId());
        }

        // 4. Delete from S3 (Approved Bucket)
        try {
            s3Service.deleteFile(approvedBucket, content.getS3Key());
            log.info("Deleted file from S3: {}", content.getS3Key());
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", content.getS3Key(), e);
        }

        // 5. Delete Content from DB
        contentRepository.delete(content);
        log.info("Deleted content {}", contentId);
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
