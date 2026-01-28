package com.DOAP.dto;

import com.DOAP.entity.enums.ScreenOrientation;
import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.entity.enums.ScreenType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenResponse {

    private Long id;
    private String screenName;
    private String description;

    // Location
    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String location; // Legacy/Composite
    private Double latitude;
    private Double longitude;

    // Pricing & Classification
    private Double pricePerHour;
    private Double ownerBaseRate;

    private com.DOAP.entity.enums.FootfallCategory footfallCategory;
    private com.DOAP.entity.enums.VisibilityLevel visibilityLevel;
    private String zone;

    // Tech Specs
    private ScreenType screenType;
    private ScreenOrientation orientation;
    private Integer screenWidth;
    private Integer screenHeight;
    private Integer resolutionWidth;
    private Integer resolutionHeight;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime activeFrom;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime activeTo;

    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerRole;
    private ScreenStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
