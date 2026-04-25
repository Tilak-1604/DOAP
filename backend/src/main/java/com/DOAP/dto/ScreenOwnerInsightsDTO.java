package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenOwnerInsightsDTO {
    private String mostBookedScreen;
    private String leastBookedScreen;
    private Double highestUtilizationRate;

    private String peakTimeSlots;
    private String peakDays;

    private Double bookingConversionRate;
    private Double cancellationRate;

    private Double pricingInsightScore;
    private Double avgAiMatchScore;
}
