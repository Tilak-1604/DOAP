package com.DOAP.dto;

import com.DOAP.entity.enums.ScreenStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenWithEarningsDTO {
    private Long id;
    private String screenName;
    private String city;
    private String pincode;
    private String screenType;
    private ScreenStatus status;
    private Double earnings;
    private Integer bookingCount;
}
