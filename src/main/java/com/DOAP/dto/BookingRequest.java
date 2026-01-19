package com.DOAP.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Long screenId;
    private Long contentId;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
}
