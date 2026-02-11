package com.DOAP.dto;

import lombok.Data;

@Data
public class AdBusinessDetailsRequest {
    private Long contentId;
    private String adTitle;
    private String businessType;
    private String campaignDescription;
    private String budgetRange;
    private String preferredTimeSlot;
}
