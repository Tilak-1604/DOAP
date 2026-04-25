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
public class ScreenOwnerBookingDTO {
    private Long id;
    private String bookingReference;
    private Long screenId;
    private String screenName;
    private String advertiserName;
    private String contentType;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private BookingStatus status;
    private Double priceAmount; // Advertiser paid
    private Double ownerEarnings; // Owner share
    private String paymentStatus;
}
