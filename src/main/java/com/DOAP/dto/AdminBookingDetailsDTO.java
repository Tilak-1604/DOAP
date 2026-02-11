package com.DOAP.dto;

import com.DOAP.entity.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingDetailsDTO {
    private Long id;

    // Advertiser Info
    private Long advertiserId;
    private String advertiserName;
    private String advertiserEmail;

    // Screen Owner Info
    private Long screenId;
    private String screenName;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;

    // Ad Info
    private Long contentId;
    private String adTitle; // From AdBusinessDetails if available
    private String adS3Url;
    private String adType; // IMAGE/VIDEO

    // Booking Details
    private Double priceAmount;
    private LocalDateTime bookedAt;
    private LocalDateTime confirmedAt;
    private BookingStatus status;
    private String paymentStatus;
}
