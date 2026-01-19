package com.DOAP.entity;

import com.DOAP.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_screen_status_dates", columnList = "screenId, status, startDatetime, endDatetime")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingReference; // UUID

    @Column(nullable = false)
    private Long advertiserId; // User ID of the advertiser

    @Column(nullable = false)
    private Long screenId;

    @Column(nullable = false)
    private Long contentId; // Must be APPROVED content

    @Column(nullable = false)
    private LocalDateTime startDatetime;

    @Column(nullable = false)
    private LocalDateTime endDatetime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false)
    private Double priceAmount; // Snapshot of the final price at booking time

    private LocalDateTime confirmedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime expiresAt; // Only relevant for HELD status

    @PrePersist
    public void generateReference() {
        if (this.bookingReference == null) {
            this.bookingReference = UUID.randomUUID().toString();
        }
    }
}
