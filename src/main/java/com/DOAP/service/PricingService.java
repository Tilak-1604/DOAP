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
        double hours = minutes / 60.0;
        // Ensure minimum 1 hour billing or exact minutes? Let's do exact pro-rata for
        // now
        // But master prompt suggested "hours", typically outdoor is hourly.
        // Let's stick to exact logic: (rate / 60) * minutes

        return screen.getPricePerHour() * (minutes / 60.0);
    }

    /**
     * Calculates the earning the Screen Owner receives.
     * Formula: ownerBaseRate * duration (hours)
     */
    public Double calculateOwnerEarning(Screen screen, LocalDateTime start, LocalDateTime end) {
        long minutes = Duration.between(start, end).toMinutes();
        return screen.getOwnerBaseRate() * (minutes / 60.0);
    }
}
