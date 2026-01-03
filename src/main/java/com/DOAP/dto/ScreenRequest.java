package com.DOAP.dto;

import com.DOAP.entity.enums.ScreenOrientation;
import com.DOAP.entity.enums.ScreenType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenRequest {

    // Step 1: Basic Info
    @NotBlank(message = "Screen name is required")
    private String screenName;

    @NotBlank(message = "Description is required") // Made required as per new UX flow recommendation
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private Double latitude;
    private Double longitude;

    // Step 2: Technical Specs
    @NotNull(message = "Screen type is required")
    private ScreenType screenType;

    @NotNull(message = "Orientation is required")
    private ScreenOrientation orientation;

    private Integer screenWidth;
    private Integer screenHeight;

    @NotNull(message = "Resolution width is required")
    private Integer resolutionWidth;

    @NotNull(message = "Resolution height is required")
    private Integer resolutionHeight;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime activeFrom;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime activeTo;

    // Legacy support (optional, can be removed if not needed)
    private String location;
}
