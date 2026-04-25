package com.DOAP.service;

import com.DOAP.entity.Booking;
import com.DOAP.entity.enums.BookingStatus;
import com.DOAP.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingCleanupService {

    private final BookingRepository bookingRepository;

    /**
     * Runs every minute to check for expired HELD bookings.
     * If a booking is in HELD state and its expiresAt time has passed,
     * mark it as EXPIRED/FAILED availability will open up automatically.
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void cleanupExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();

        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now);

        if (!expiredBookings.isEmpty()) {
            log.info("Found {} expired bookings. Marking as EXPIRED.", expiredBookings.size());

            for (Booking booking : expiredBookings) {
                log.info("Expiring Booking ID: {} (Reference: {}). Expired at: {}",
                        booking.getId(), booking.getBookingReference(), booking.getExpiresAt());
                booking.setStatus(BookingStatus.EXPIRED);
            }

            bookingRepository.saveAll(expiredBookings);
            log.info("Successfully expired {} bookings. Screens are now released.", expiredBookings.size());
        }
    }
}
