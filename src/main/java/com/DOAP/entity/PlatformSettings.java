package com.DOAP.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "platform_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private Double commissionPercentage = 25.0; // Platform commission (25%)

    @Column(nullable = false)
    @Builder.Default
    private Integer minimumBookingDurationMinutes = 60; // Minimum 1 hour

    @Column(nullable = false)
    @Builder.Default
    private Boolean maintenanceMode = false; // Platform maintenance toggle

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoApproveScreens = false; // Auto-approve screen submissions

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
