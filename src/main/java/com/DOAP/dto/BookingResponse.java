package com.DOAP.dto;

import com.DOAP.entity.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long screenId;
    private Long contentId;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private BookingStatus status;
    private LocalDateTime expiresAt;
    private Double priceAmount;
    private LocalDateTime confirmedAt;
}
