package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDTO {

    // User Statistics
    private Long totalUsers;
    private Long totalAdvertisers;
    private Long totalScreenOwners;

    // Screen Statistics
    private Long totalScreens;
    private Long ownerScreens;
    private Long doapScreens;

    // Content Statistics
    private Long totalAdsUploaded;

    // Booking Statistics
    private Long totalBookings;
    private Long heldBookings;
    private Long confirmedBookings;

    // Revenue Statistics
    private Double totalDoapRevenue; // Commission + Direct Revenue
    private Double commissionRevenue; // 25% from owner screens
    private Double directRevenue; // 100% from DOAP screens
}
