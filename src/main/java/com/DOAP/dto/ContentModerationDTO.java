package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentModerationDTO {

    private Long contentId;
    private String s3Url; // Preview URL
    private String contentType; // IMAGE or VIDEO
    private String advertiserName;
    private String advertiserEmail;
    private String aiModerationResult; // From Rekognition
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime uploadedAt;
    private String validationDetails; // AI labels or rejection reason
}
