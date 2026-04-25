package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPlatformSummaryDTO {
    private Long totalUsers;
    private Long totalAdvertisers;
    private Long totalScreenOwners;
    private Long totalScreens;
    private Long activeScreens;
    private Long pendingScreens;
    private Long totalBookings;
    private Double totalRevenue;
    private Long totalAds;
}
