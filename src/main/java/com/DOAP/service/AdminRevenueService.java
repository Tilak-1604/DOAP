package com.DOAP.service;

import com.DOAP.dto.RevenueBreakdownDTO;
import com.DOAP.entity.Booking;
import com.DOAP.entity.OwnerEarnings;
import com.DOAP.entity.Screen;
import com.DOAP.entity.enums.BookingStatus;
import com.DOAP.repository.BookingRepository;
import com.DOAP.repository.OwnerEarningsRepository;
import com.DOAP.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminRevenueService {

    private final BookingRepository bookingRepository;
    private final OwnerEarningsRepository ownerEarningsRepository;
    private final ScreenRepository screenRepository;

    public RevenueBreakdownDTO getRevenueBreakdown() {
        log.info("Calculating revenue breakdown");

        // Get all confirmed bookings
        List<Booking> confirmedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.toList());

        // Total advertiser spend
        Double totalAdvertiserSpend = confirmedBookings.stream()
                .mapToDouble(Booking::getPriceAmount)
                .sum();

        // Get all earnings records
        List<OwnerEarnings> allEarnings = ownerEarningsRepository.findAll();

        // Total paid to screen owners (75%)
        Double totalPaidToScreenOwners = allEarnings.stream()
                .mapToDouble(OwnerEarnings::getOwnerAmount)
                .sum();

        // Total DOAP commission (25% from owner screens)
        Double totalDoapCommission = allEarnings.stream()
                .mapToDouble(OwnerEarnings::getPlatformCommission)
                .sum();

        // Revenue from DOAP-owned screens (100%)
        Double revenueFromDoapScreens = calculateDoapScreenRevenue(confirmedBookings);

        // Total DOAP revenue
        Double totalDoapRevenue = totalDoapCommission + revenueFromDoapScreens;

        // Monthly revenue data
        Map<String, Double> monthlyCommissionRevenue = calculateMonthlyCommission(allEarnings);
        Map<String, Double> monthlyDirectRevenue = calculateMonthlyDoapRevenue(confirmedBookings);
        Map<String, Double> monthlyTotalRevenue = new HashMap<>();

        // Combine monthly revenues
        monthlyCommissionRevenue.forEach((month, commission) -> {
            Double direct = monthlyDirectRevenue.getOrDefault(month, 0.0);
            monthlyTotalRevenue.put(month, commission + direct);
        });
        monthlyDirectRevenue.forEach((month, direct) -> {
            if (!monthlyTotalRevenue.containsKey(month)) {
                monthlyTotalRevenue.put(month, direct);
            }
        });

        return RevenueBreakdownDTO.builder()
                .totalAdvertiserSpend(totalAdvertiserSpend)
                .totalPaidToScreenOwners(totalPaidToScreenOwners)
                .totalDoapCommission(totalDoapCommission)
                .revenueFromDoapScreens(revenueFromDoapScreens)
                .totalDoapRevenue(totalDoapRevenue)
                .monthlyCommissionRevenue(monthlyCommissionRevenue)
                .monthlyDirectRevenue(monthlyDirectRevenue)
                .monthlyTotalRevenue(monthlyTotalRevenue)
                .build();
    }

    private Double calculateDoapScreenRevenue(List<Booking> confirmedBookings) {
        return confirmedBookings.stream()
                .filter(booking -> {
                    Screen screen = screenRepository.findById(booking.getScreenId()).orElse(null);
                    return screen != null && "ADMIN".equals(screen.getOwnerRole());
                })
                .mapToDouble(Booking::getPriceAmount)
                .sum();
    }

    private Map<String, Double> calculateMonthlyCommission(List<OwnerEarnings> earnings) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        return earnings.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCreatedAt().format(formatter),
                        Collectors.summingDouble(OwnerEarnings::getPlatformCommission)));
    }

    private Map<String, Double> calculateMonthlyDoapRevenue(List<Booking> confirmedBookings) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        return confirmedBookings.stream()
                .filter(booking -> {
                    Screen screen = screenRepository.findById(booking.getScreenId()).orElse(null);
                    return screen != null && "ADMIN".equals(screen.getOwnerRole());
                })
                .collect(Collectors.groupingBy(
                        b -> b.getConfirmedAt().format(formatter),
                        Collectors.summingDouble(Booking::getPriceAmount)));
    }
}
