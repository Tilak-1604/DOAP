package com.DOAP.service;

import com.DOAP.entity.Screen;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PricingService {

    /**
     * Calculates the price the Advertiser pays.
     * Formula: (BaseRate * TimeMultiplier * QualityMultiplier * SizeMultiplier) *
     * Duration
     */
    public Double calculateAdvertiserPrice(Screen screen, LocalDateTime start, LocalDateTime end) {
        // 1. Base Rate (Fixed Global)
        Double baseRate = 500.0;

        // 2. Calculate Multipliers
        Double timeMultiplier = getTimeMultiplier(start);
        Double qualityMultiplier = getQualityMultiplier(screen);
        Double sizeMultiplier = getSizeMultiplier(screen);

        System.out.println("Pricing Debug: Screen=" + screen.getId() +
                " | Base=" + baseRate +
                " | TimeMult=" + timeMultiplier +
                " | QualityMult=" + qualityMultiplier +
                " | SizeMult=" + sizeMultiplier);

        // 3. Final Hourly Rate
        Double finalHourlyRate = baseRate * timeMultiplier * qualityMultiplier * sizeMultiplier;

        // 4. Duration
        long minutes = Duration.between(start, end).toMinutes();
        Double hours = minutes / 60.0;

        return finalHourlyRate * hours;
    }

    private Double getTimeMultiplier(LocalDateTime start) {
        // Peak Hours: 18:00 to 22:00
        int hour = start.getHour();
        if (hour >= 18 && hour < 22) {
            return 1.5; // 1.5x for Peak Time
        }
        return 1.0;
    }

    private Double getQualityMultiplier(Screen screen) {
        // 4K Resolution (> 3000px width)
        if (screen.getResolutionWidth() != null && screen.getResolutionWidth() >= 3840) {
            return 1.2; // 1.2x for 4K
        }
        return 1.0;
    }

    private Double getSizeMultiplier(Screen screen) {
        // Large Screen (Area > 2M pixels)
        if (screen.getScreenWidth() != null && screen.getScreenHeight() != null) {
            long area = (long) screen.getScreenWidth() * screen.getScreenHeight();
            if (area > 2000000) {
                return 2.0; // 2.0x for Large Screens
            }
        }
        return 1.0;
    }

    private final PlatformSettingsService platformSettingsService;

    public PricingService(PlatformSettingsService platformSettingsService) {
        this.platformSettingsService = platformSettingsService;
    }

    /**
     * Calculates the earning the Screen Owner receives.
     * Formula: (100% - Commission%) of advertiser payment
     */
    public Double calculateOwnerEarning(Screen screen, LocalDateTime start, LocalDateTime end) {
        // Calculate what the advertiser pays
        Double advertiserPrice = calculateAdvertiserPrice(screen, start, end);

        // Get commission percentage from settings (default to 25.0 if not found)
        Double commissionPercent = 25.0;
        try {
            commissionPercent = platformSettingsService.getSettings().getCommissionPercentage();
        } catch (Exception e) {
            // Fallback to default
        }

        // Owner receives the remainder
        Double ownerShareMultiplier = (100.0 - commissionPercent) / 100.0;
        return advertiserPrice * ownerShareMultiplier;
    }
}
