package com.DOAP.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenRequest {

    @NotBlank(message = "Screen name is required")
    private String screenName;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;
}
