package com.DOAP.service;

import com.DOAP.dto.ScreenOwnerBookingDTO;
import com.DOAP.dto.ScreenOwnerDashboardDTO;
import com.DOAP.dto.ScreenOwnerEarningsDTO;
import com.DOAP.dto.ScreenOwnerInsightsDTO;
import com.DOAP.dto.ScreenWithEarningsDTO;
import com.DOAP.entity.Booking;
import com.DOAP.entity.Content;
import com.DOAP.entity.Screen;
import com.DOAP.entity.User;
import com.DOAP.repository.BookingRepository;
import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.repository.ContentRepository;
import com.DOAP.repository.ScreenRepository;
import com.DOAP.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScreenOwnerService {

        private final ScreenRepository screenRepository;
        private final BookingRepository bookingRepository;
        private final BookingService bookingService;
        private final PricingService pricingService;
        private final UserRepository userRepository;
        private final ContentRepository contentRepository;

        public List<ScreenOwnerBookingDTO> getOwnerBookings(Long ownerId) {
                List<Screen> ownerScreens = screenRepository.findByOwnerId(ownerId);
                if (ownerScreens.isEmpty()) {
                        return Collections.emptyList();
                }

                List<Long> screenIds = ownerScreens.stream()
                                .map(Screen::getId)
                                .collect(Collectors.toList());

                List<Booking> bookings = bookingRepository.findByScreenIdIn(screenIds);

                return bookings.stream().map(b -> {
                        Screen screen = ownerScreens.stream().filter(s -> s.getId().equals(b.getScreenId())).findFirst()
                                        .orElse(null);
                        User advertiser = userRepository.findById(b.getAdvertiserId()).orElse(null);
                        Content content = contentRepository.findById(b.getContentId()).orElse(null);

                        Double ownerEarning = 0.0;
                        if (screen != null) {
                                ownerEarning = pricingService.calculateOwnerEarning(screen, b.getStartDatetime(),
                                                b.getEndDatetime());
                        }

                        return ScreenOwnerBookingDTO.builder()
                                        .id(b.getId())
                                        .bookingReference(b.getBookingReference())
                                        .screenId(b.getScreenId())
                                        .screenName(screen != null ? screen.getScreenName() : "Unknown")
                                        .advertiserName(advertiser != null ? advertiser.getName() : "Unknown")
                                        .contentType(content != null ? content.getContentType().toString() : "Unknown")
                                        .startDatetime(b.getStartDatetime())
                                        .endDatetime(b.getEndDatetime())
                                        .status(b.getStatus())
                                        .priceAmount(b.getPriceAmount())
                                        .ownerEarnings(ownerEarning)
                                        .paymentStatus("PAID") // Simplified logic for demo
                                        .build();
                }).collect(Collectors.toList());
        }

        public ScreenOwnerDashboardDTO getDashboardStats(Long ownerId) {
                List<Screen> ownerScreens = screenRepository.findByOwnerId(ownerId);

                int totalScreens = ownerScreens.size();
                int activeScreens = (int) ownerScreens.stream()
                                .filter(s -> s.getStatus() == ScreenStatus.ACTIVE)
                                .count();

                List<Long> screenIds = ownerScreens.stream()
                                .map(Screen::getId)
                                .collect(Collectors.toList());

                double totalEarnings = screenIds.stream()
                                .mapToDouble(id -> {
                                        Double e = bookingService.calculateScreenEarnings(id);
                                        return e != null ? e : 0.0;
                                })
                                .sum();

                int upcomingBookings = bookingService.getUpcomingBookingsCountForOwner(ownerId, screenIds);

                return ScreenOwnerDashboardDTO.builder()
                                .totalScreens(totalScreens)
                                .activeScreens(activeScreens)
                                .totalEarnings(totalEarnings)
                                .upcomingBookings(upcomingBookings)
                                .build();
        }

        public List<ScreenWithEarningsDTO> getScreensWithEarnings(Long ownerId) {
                List<Screen> ownerScreens = screenRepository.findByOwnerId(ownerId);

                return ownerScreens.stream()
                                .map(screen -> {
                                        Double earnings = bookingService.calculateScreenEarnings(screen.getId());
                                        Integer bookingCount = bookingService.getScreenBookings(screen.getId()).size();

                                        return ScreenWithEarningsDTO.builder()
                                                        .id(screen.getId())
                                                        .screenName(screen.getScreenName())
                                                        .city(screen.getCity())
                                                        .pincode(screen.getPincode())
                                                        .screenType(screen.getScreenType() != null
                                                                        ? screen.getScreenType().toString()
                                                                        : "UNKNOWN")
                                                        .status(screen.getStatus())
                                                        .earnings(earnings)
                                                        .bookingCount(bookingCount)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        public ScreenOwnerEarningsDTO getEarnings(Long ownerId) {
                List<Screen> ownerScreens = screenRepository.findByOwnerId(ownerId);
                List<Long> screenIds = ownerScreens.stream().map(Screen::getId).collect(Collectors.toList());
                List<Booking> allBookings = bookingRepository.findByScreenIdIn(screenIds);

                LocalDateTime now = LocalDateTime.now();
                LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                LocalDateTime lastMonthStart = monthStart.minusMonths(1);
                LocalDateTime lastMonthEnd = monthStart.minusNanos(1);

                Double totalLifetime = 0.0;
                Double currentMonth = 0.0;
                Double lastMonth = 0.0;
                Double pending = 0.0;

                java.util.Map<Long, Double> screenEarningsMap = new java.util.HashMap<>();
                List<ScreenOwnerEarningsDTO.EarningsHistoryItem> history = new java.util.ArrayList<>();

                for (Booking b : allBookings) {
                        if (b.getStatus() == com.DOAP.entity.enums.BookingStatus.CONFIRMED) {
                                Screen screen = ownerScreens.stream().filter(s -> s.getId().equals(b.getScreenId()))
                                                .findFirst().orElse(null);
                                if (screen == null)
                                        continue;

                                Double earning = pricingService.calculateOwnerEarning(screen, b.getStartDatetime(),
                                                b.getEndDatetime());
                                totalLifetime += earning;

                                if (b.getStartDatetime().isAfter(monthStart)) {
                                        currentMonth += earning;
                                } else if (b.getStartDatetime().isAfter(lastMonthStart)
                                                && b.getStartDatetime().isBefore(lastMonthEnd)) {
                                        lastMonth += earning;
                                }

                                if (b.getEndDatetime().isAfter(now)) {
                                        pending += earning;
                                }

                                screenEarningsMap.merge(screen.getId(), earning, Double::sum);

                                history.add(ScreenOwnerEarningsDTO.EarningsHistoryItem.builder()
                                                .screenName(screen.getScreenName())
                                                .bookingId(b.getId())
                                                .duration(java.time.Duration
                                                                .between(b.getStartDatetime(), b.getEndDatetime())
                                                                .toHours() + "h")
                                                .amountEarned(earning)
                                                .dateCredited(b.getConfirmedAt() != null ? b.getConfirmedAt()
                                                                : b.getCreatedAt())
                                                .status("PAID") // Simplified
                                                .build());
                        }
                }

                List<ScreenOwnerEarningsDTO.ScreenEarningsBreakdown> breakdown = ownerScreens.stream()
                                .map(s -> ScreenOwnerEarningsDTO.ScreenEarningsBreakdown.builder()
                                                .screenName(s.getScreenName())
                                                .earnings(screenEarningsMap.getOrDefault(s.getId(), 0.0))
                                                .build())
                                .collect(Collectors.toList());

                return ScreenOwnerEarningsDTO.builder()
                                .totalLifetimeEarnings(totalLifetime)
                                .currentMonthEarnings(currentMonth)
                                .lastMonthEarnings(lastMonth)
                                .pendingEarnings(pending)
                                .screenBreakdown(breakdown)
                                .earningsHistory(history)
                                .availableBalance(totalLifetime * 0.7) // Mocked
                                .paidOut(totalLifetime * 0.2) // Mocked
                                .pendingPayout(totalLifetime * 0.1) // Mocked
                                .build();
        }

        public ScreenOwnerInsightsDTO getInsights(Long ownerId) {
                List<Screen> ownerScreens = screenRepository.findByOwnerId(ownerId);
                List<Long> screenIds = ownerScreens.stream().map(Screen::getId).collect(Collectors.toList());
                List<Booking> allBookings = bookingRepository.findByScreenIdIn(screenIds);

                if (allBookings.isEmpty()) {
                        return ScreenOwnerInsightsDTO.builder()
                                        .mostBookedScreen("N/A")
                                        .leastBookedScreen("N/A")
                                        .highestUtilizationRate(0.0)
                                        .bookingConversionRate(0.0)
                                        .cancellationRate(0.0)
                                        .avgAiMatchScore(0.0)
                                        .build();
                }

                // Screen popularity
                java.util.Map<Long, Long> screenBookingCounts = allBookings.stream()
                                .collect(Collectors.groupingBy(Booking::getScreenId, Collectors.counting()));

                Long mostBookedId = screenBookingCounts.entrySet().stream()
                                .max((e1, e2) -> e1.getValue().compareTo(e2.getValue()))
                                .map(java.util.Map.Entry::getKey).orElse(null);
                Long leastBookedId = screenBookingCounts.entrySet().stream()
                                .min((e1, e2) -> e1.getValue().compareTo(e2.getValue()))
                                .map(java.util.Map.Entry::getKey).orElse(null);

                String mostBooked = "N/A";
                if (mostBookedId != null) {
                        mostBooked = ownerScreens.stream().filter(s -> s.getId().equals(mostBookedId))
                                        .map(Screen::getScreenName).findFirst().orElse("N/A");
                }
                String leastBooked = "N/A";
                if (leastBookedId != null) {
                        leastBooked = ownerScreens.stream().filter(s -> s.getId().equals(leastBookedId))
                                        .map(Screen::getScreenName).findFirst().orElse("N/A");
                }

                // Conversion rates
                long confirmed = allBookings.stream()
                                .filter(b -> b.getStatus() == com.DOAP.entity.enums.BookingStatus.CONFIRMED).count();
                long cancelled = allBookings.stream()
                                .filter(b -> b.getStatus() == com.DOAP.entity.enums.BookingStatus.CANCELLED).count();
                double conversion = (double) confirmed / allBookings.size() * 100;
                double cancellation = (double) cancelled / allBookings.size() * 100;

                // Peak times
                java.util.Map<Integer, Long> hourCounts = allBookings.stream()
                                .collect(Collectors.groupingBy(b -> b.getStartDatetime().getHour(),
                                                Collectors.counting()));
                Integer peakHour = hourCounts.entrySet().stream().max(java.util.Map.Entry.comparingByValue())
                                .map(java.util.Map.Entry::getKey).orElse(18);

                return ScreenOwnerInsightsDTO.builder()
                                .mostBookedScreen(mostBooked)
                                .leastBookedScreen(leastBooked)
                                .highestUtilizationRate(68.5) // Mocked calculation
                                .peakTimeSlots(peakHour + ":00 - " + (peakHour + 2) + ":00")
                                .peakDays("Weekends (Sat-Sun)")
                                .bookingConversionRate(conversion)
                                .cancellationRate(cancellation)
                                .pricingInsightScore(8.5)
                                .avgAiMatchScore(0.85)
                                .build();
        }
}
