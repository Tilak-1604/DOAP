package com.DOAP.service;

import com.DOAP.entity.Booking;
import com.DOAP.entity.OwnerEarnings;
import com.DOAP.entity.Screen;
import com.DOAP.entity.enums.EarningStatus;
import com.DOAP.repository.OwnerEarningsRepository;
import com.DOAP.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
@Slf4j
public class EarningsService {

    private final OwnerEarningsRepository ownerEarningsRepository;
    private final ScreenRepository screenRepository;
    private final PricingService pricingService;

    @Transactional
    public void recordEarning(Booking booking) {
        log.info("Recording earnings for booking: {}", booking.getId());

        Screen screen = screenRepository.findById(booking.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found for earning calculation"));

        Double ownerAmount = pricingService.calculateOwnerEarning(screen, booking.getStartDatetime(),
                booking.getEndDatetime());
        Double platformCommission = booking.getPriceAmount() - ownerAmount;

        // Calculate Week Window (Monday to Sunday)
        LocalDate bookingDate = booking.getStartDatetime().toLocalDate();
        LocalDate weekStart = bookingDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = bookingDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        OwnerEarnings earning = OwnerEarnings.builder()
                .bookingId(booking.getId())
                .screenOwnerId(screen.getOwnerId())
                .screenId(screen.getId())
                .ownerAmount(ownerAmount)
                .platformCommission(platformCommission)
                .weekStartDate(weekStart)
                .weekEndDate(weekEnd)
                .status(EarningStatus.PENDING)
                .build();

        ownerEarningsRepository.save(earning);
        log.info("Earning recorded: Owner receives {}, Platform keeps {}", ownerAmount, platformCommission);
    }
}
