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

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void expireOldBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now);

        if (!expiredBookings.isEmpty()) {
            log.info("Found {} bookings to expire", expiredBookings.size());
            for (Booking booking : expiredBookings) {
                booking.setStatus(BookingStatus.EXPIRED);
                log.info("Expired booking: {}", booking.getBookingReference());
            }
            bookingRepository.saveAll(expiredBookings);
        }
    }
}
