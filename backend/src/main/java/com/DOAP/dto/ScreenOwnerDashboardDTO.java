package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenOwnerDashboardDTO {
    private Integer totalScreens;
    private Integer activeScreens;
    private Double totalEarnings;
    private Integer upcomingBookings;
}
