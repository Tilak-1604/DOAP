package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MLRecommendationRequest {
    private String advertiser_text;
    private List<MLScreenData> screens;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MLScreenData {
        private Long id;
        private String text;
    }
}
