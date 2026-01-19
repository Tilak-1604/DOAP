package com.DOAP.entity;

import com.DOAP.entity.enums.EarningStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "owner_earnings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerEarnings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private Long screenOwnerId;

    @Column(nullable = false)
    private Long screenId;

    @Column(nullable = false)
    private Double ownerAmount; // What the owner gets

    @Column(nullable = false)
    private Double platformCommission; // What DOAP keeps

    @Column(nullable = false)
    private LocalDate weekStartDate; // Monday of that week

    @Column(nullable = false)
    private LocalDate weekEndDate; // Sunday of that week

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EarningStatus status; // PENDING, PAID

    @CreationTimestamp
    private LocalDateTime createdAt;
}
