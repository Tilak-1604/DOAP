package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingsDTO {

    private Double commissionPercentage;
    private Integer minimumBookingDurationMinutes;
    private Boolean maintenanceMode;
    private Boolean autoApproveScreens;
}
