package com.DOAP.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenOwnerEarningsDTO {
    private Double totalLifetimeEarnings;
    private Double currentMonthEarnings;
    private Double lastMonthEarnings;
    private Double pendingEarnings;

    private List<ScreenEarningsBreakdown> screenBreakdown;
    private List<EarningsHistoryItem> earningsHistory;

    private Double availableBalance;
    private Double paidOut;
    private Double pendingPayout;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScreenEarningsBreakdown {
        private String screenName;
        private Double earnings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EarningsHistoryItem {
        private String screenName;
        private Long bookingId;
        private String duration;
        private Double amountEarned;
        private LocalDateTime dateCredited;
        private String status;
    }
}
