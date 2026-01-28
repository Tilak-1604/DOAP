package com.DOAP.service;

import com.DOAP.entity.Screen;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PricingService {

    /**
     * Calculates the price the Advertiser pays.
     * Formula: pricePerHour * duration (hours)
     */
    public Double calculateAdvertiserPrice(Screen screen, LocalDateTime start, LocalDateTime end) {
        long minutes = Duration.between(start, end).toMinutes();
        Double rate = (screen.getPricePerHour() != null && screen.getPricePerHour() > 0)
                ? screen.getPricePerHour()
                : 500.0; // Fallback to default
        return rate * (minutes / 60.0);
    }

    /**
     * Calculates the earning the Screen Owner receives.
     * Formula: ownerBaseRate * duration (hours)
     */
    public Double calculateOwnerEarning(Screen screen, LocalDateTime start, LocalDateTime end) {
        long minutes = Duration.between(start, end).toMinutes();
        Double rate = (screen.getOwnerBaseRate() != null && screen.getOwnerBaseRate() > 0)
                ? screen.getOwnerBaseRate()
                : 300.0; // Fallback to default
        return rate * (minutes / 60.0);
    }
}
