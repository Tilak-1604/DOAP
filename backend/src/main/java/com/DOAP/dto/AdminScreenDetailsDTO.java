package com.DOAP.dto;

import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.entity.enums.ScreenType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminScreenDetailsDTO {
    private Long id;
    private String screenName;
    private String location;
    private String city;
    private Long ownerId;
    private String ownerRole;
    private String ownerName;
    private String ownerEmail;
    private ScreenStatus status;
    private Double pricePerHour;
    private ScreenType screenType;
    private LocalDateTime createdAt;
}
