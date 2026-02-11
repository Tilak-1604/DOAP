package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueBreakdownDTO {

    // Total Revenue Metrics
    private Double totalAdvertiserSpend;
    private Double totalPaidToScreenOwners;
    private Double totalDoapCommission; // 25% from owner screens
    private Double revenueFromDoapScreens; // 100% from DOAP screens
    private Double totalDoapRevenue; // Commission + DOAP screens

    // Monthly Revenue Data (for charts)
    // Key: Month (e.g., "2026-01"), Value: Revenue amount
    private Map<String, Double> monthlyCommissionRevenue;
    private Map<String, Double> monthlyDirectRevenue;
    private Map<String, Double> monthlyTotalRevenue;
}
