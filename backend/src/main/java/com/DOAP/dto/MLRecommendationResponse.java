package com.DOAP.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MLRecommendationResponse {

    @JsonProperty("screenId")
    private Long screenId;

    private Double score;
}
