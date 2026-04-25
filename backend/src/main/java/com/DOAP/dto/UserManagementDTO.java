package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDTO {

    private Long userId;
    private String name;
    private String email;
    private List<String> roles;
    private Boolean isActive;

    // For Screen Owners
    private Long numberOfScreens;
    private Double totalEarnings;

    // For Advertisers
    private Long adsUploaded;
    private Double totalSpend;
}
