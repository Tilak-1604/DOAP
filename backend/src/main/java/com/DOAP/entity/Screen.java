package com.DOAP.entity;

import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.entity.enums.FootfallCategory;
import com.DOAP.entity.enums.VisibilityLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "screens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String screenName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long ownerId; // Decoupled from User entity, stores ID only

    @Column(nullable = false)
    private String ownerRole; // "ADMIN" or "SCREEN_OWNER"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScreenStatus status;

    @Column(nullable = true)
    private String category; // e.g., Mall, Shop, Highway

    // --- Phase 2: Pricing & Earnings ---
    // --- Phase 2: Pricing & Earnings ---
    @Builder.Default
    @Column(nullable = false)
    private Double pricePerHour = 500.0; // Default Advertiser Rate

    @Builder.Default
    @Column(nullable = false)
    private Double ownerBaseRate = 300.0; // Default Owner Payout Rate

    // --- New Phase 2 Fields ---

    // Location Details
    private String city;
    private String address;
    private String state;
    private String country;
    private String pincode;

    private Double latitude;
    private Double longitude;

    // Structured Location Details (New Fields)
    @Enumerated(EnumType.STRING)
    private FootfallCategory footfallCategory;

    @Enumerated(EnumType.STRING)
    private VisibilityLevel visibilityLevel;

    private String zone; // e.g., North, South, Central

    // Technical Specs
    @Enumerated(EnumType.STRING)
    private com.DOAP.entity.enums.ScreenType screenType;

    @Enumerated(EnumType.STRING)
    private com.DOAP.entity.enums.ScreenOrientation orientation;

    private Integer screenWidth;
    private Integer screenHeight;
    private Integer resolutionWidth;
    private Integer resolutionHeight;

    private LocalTime activeFrom;
    private LocalTime activeTo;

    private Long approvedBy; // Admin User ID

    private LocalDateTime approvedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Long createdBy; // User ID who created the record
}
