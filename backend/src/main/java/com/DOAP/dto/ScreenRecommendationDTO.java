package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreenRecommendationDTO {
    private Long screenId;
    private String screenName;
    private String location;
    private Double score;
    private String city;
    private Double pricePerHour;
}
