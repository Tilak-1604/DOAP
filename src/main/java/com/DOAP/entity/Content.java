package com.DOAP.entity;

import com.DOAP.entity.enums.ContentStatus;
import com.DOAP.entity.enums.ContentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "content")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "s3_url", nullable = false)
    private String s3Url;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentStatus status;

    @Column(nullable = false)
    private Long uploaderId; // User ID who uploaded the content

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;

    @Column(columnDefinition = "TEXT")
    private String validationDetails; // Store Rekognition labels or rejection reason
}
