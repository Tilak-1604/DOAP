package com.DOAP.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ad_vision_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdVisionMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @Column(columnDefinition = "TEXT")
    private String detectedLabels; // Comma separated or JSON

    @Column(columnDefinition = "TEXT")
    private String detectedText; // OCR results

    @Column(columnDefinition = "TEXT")
    private String moderationResult; // Safety labels

    @Column(columnDefinition = "TEXT")
    private String confidenceScores; // JSON of confidence

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime processedAt;
}
