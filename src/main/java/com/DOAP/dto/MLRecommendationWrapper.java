package com.DOAP.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MLRecommendationWrapper {

    @JsonProperty("results")
    private List<MLRecommendationResponse> results;

    private String error; // optional, if ML sends it
}
