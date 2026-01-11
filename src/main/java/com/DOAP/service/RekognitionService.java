package com.DOAP.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

import java.util.List;

@Service
public class RekognitionService {

    private final RekognitionClient rekognitionClient;

    public RekognitionService(@Value("${aws.access.key.id}") String accessKey,
                              @Value("${aws.secret.access.key}") String secretKey,
                              @Value("${aws.region}") String region) {
        this.rekognitionClient = RekognitionClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    public List<ModerationLabel> detectModerationLabels(String bucketName, String key) {
        S3Object s3Object = S3Object.builder()
                .bucket(bucketName)
                .name(key)
                .build();

        Image image = Image.builder()
                .s3Object(s3Object)
                .build();

        DetectModerationLabelsRequest request = DetectModerationLabelsRequest.builder()
                .image(image)
                .minConfidence(60F) // Set minimum confidence level
                .build();

        DetectModerationLabelsResponse response = rekognitionClient.detectModerationLabels(request);
        return response.moderationLabels();
    }

    // public int detectFaceCount(String bucketName, String key) {
    // S3Object s3Object = S3Object.builder()
    // .bucket(bucketName)
    // .name(key)
    // .build();

    // Image image = Image.builder()
    // .s3Object(s3Object)
    // .build();

    // DetectFacesRequest request = DetectFacesRequest.builder()
    // .image(image)
    // .build();

    // DetectFacesResponse response = rekognitionClient.detectFaces(request);
    // return response.faceDetails().size();
    // }

    // public int detectTextCount(String bucketName, String key) {
    // S3Object s3Object = S3Object.builder()
    // .bucket(bucketName)
    // .name(key)
    // .build();

    // Image image = Image.builder()
    // .s3Object(s3Object)
    // .build();

    // DetectTextRequest request = DetectTextRequest.builder()
    // .image(image)
    // .build();

    // DetectTextResponse response = rekognitionClient.detectText(request);
    // return response.textDetections().size();
    // }

    public List<Label> detectLabels(String bucketName, String key) {
        S3Object s3Object = S3Object.builder()
                .bucket(bucketName)
                .name(key)
                .build();

        Image image = Image.builder()
                .s3Object(s3Object)
                .build();

        DetectLabelsRequest request = DetectLabelsRequest.builder()
                .image(image)
                .minConfidence(70F)
                .build();

        DetectLabelsResponse response = rekognitionClient.detectLabels(request);
        return response.labels();
    }

    public String startVideoModeration(String bucketName, String key) {
        S3Object s3Object = S3Object.builder()
                .bucket(bucketName)
                .name(key)
                .build();

        Video video = Video.builder()
                .s3Object(s3Object)
                .build();

        StartContentModerationRequest request = StartContentModerationRequest.builder()
                .video(video)
                .minConfidence(60F)
                .build();

        StartContentModerationResponse response = rekognitionClient.startContentModeration(request);
        return response.jobId();
    }

    public List<ContentModerationDetection> getVideoModerationResults(String jobId)
            throws InterruptedException {
        GetContentModerationRequest.Builder requestBuilder = GetContentModerationRequest.builder()
                .jobId(jobId)
                .maxResults(1000); // Get up to 1000 results per page

        List<ContentModerationDetection> allDetections = new java.util.ArrayList<>();
        String nextToken = null;
        String status = "IN_PROGRESS";

        // Poll for completion (max 5 minutes for longer videos)
        int maxAttempts = 60; // 60 * 5 seconds = 5 minutes
        int attempt = 0;

        // Wait for job to complete
        while (!"SUCCEEDED".equals(status) && !"FAILED".equals(status) && attempt < maxAttempts) {
            GetContentModerationRequest checkRequest = GetContentModerationRequest.builder()
                    .jobId(jobId)
                    .build();
            GetContentModerationResponse checkResponse = rekognitionClient
                    .getContentModeration(checkRequest);
            status = checkResponse.jobStatusAsString();

            if ("IN_PROGRESS".equals(status)) {
                Thread.sleep(5000); // Wait 5 seconds before checking again
                attempt++;
            }
        }

        if (!"SUCCEEDED".equals(status)) {
            throw new RuntimeException("Video moderation job failed or timed out: " + status);
        }

        // Job succeeded - now fetch all results with pagination
        do {
            GetContentModerationRequest request = requestBuilder
                    .nextToken(nextToken)
                    .build();

            GetContentModerationResponse response = rekognitionClient.getContentModeration(request);
            allDetections.addAll(response.moderationLabels());
            nextToken = response.nextToken();

        } while (nextToken != null);

        return allDetections;
    }
}
