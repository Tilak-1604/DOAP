package com.DOAP.dto;

import com.DOAP.entity.enums.ScreenStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
// Internal response DTO (Admin / Owner usage only)
// Not exposed to end-users
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenResponse {

    private Long id;
    private String screenName;
    private String location;
    private String description;
    private Long ownerId;
    private String ownerRole;
    private ScreenStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
