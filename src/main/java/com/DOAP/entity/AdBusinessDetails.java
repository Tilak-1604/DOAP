package com.DOAP.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ad_business_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdBusinessDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @Column(nullable = false)
    private String businessType; // e.g., "Restaurant", "Retail"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String campaignDescription; // Manual intent description

    @Column(nullable = false)
    private String budgetRange; // e.g., "5000-10000"

    @Column(nullable = false)
    private String preferredTimeSlot; // e.g., "Evening", "Morning"

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
