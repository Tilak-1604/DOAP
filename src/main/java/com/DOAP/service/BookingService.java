package com.DOAP.service;

import com.DOAP.dto.BookingRequest;
import com.DOAP.dto.BookingResponse;
import com.DOAP.entity.Booking;
import com.DOAP.entity.Content;
import com.DOAP.entity.Screen;
import com.DOAP.entity.enums.BookingStatus;
import com.DOAP.entity.enums.ContentStatus;
import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.repository.BookingRepository;
import com.DOAP.repository.ContentRepository;
import com.DOAP.repository.ScreenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScreenRepository screenRepository;
    private final ContentRepository contentRepository;
    private final PricingService pricingService;

    private static final long HOLD_DURATION_MINUTES = 15;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long advertiserId) {
        // 1. Validate Time Inputs
        if (request.getStartDatetime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Booking start time cannot be in the past");
        }
        if (!request.getEndDatetime().isAfter(request.getStartDatetime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // 2. THREAD SAFETY: Acquire Lock on Screen
        Screen screen = screenRepository.findByIdWithLock(request.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        if (screen.getStatus() != ScreenStatus.ACTIVE) {
            throw new RuntimeException("Screen is not ACTIVE currently");
        }

        // 3. Validate Content
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new RuntimeException("Content not found"));

        if (!content.getUploaderId().equals(advertiserId)) {
            throw new RuntimeException("You can only book with your own content");
        }

        if (content.getStatus() != ContentStatus.APPROVED) {
            throw new RuntimeException("Content must be APPROVED to book slots");
        }

        // 4. Validate against Screen Operating Hours
        if (screen.getActiveFrom() != null && screen.getActiveTo() != null) {
            java.time.LocalTime bookingStartTime = request.getStartDatetime().toLocalTime();
            java.time.LocalTime bookingEndTime = request.getEndDatetime().toLocalTime();

            // Check if booking is BEFORE operating start
            if (bookingStartTime.isBefore(screen.getActiveFrom())) {
                throw new IllegalArgumentException(
                        "Booking start time is before screen operating hours (" + screen.getActiveFrom() + ")");
            }

            // Check if booking is AFTER operating end
            if (bookingEndTime.isAfter(screen.getActiveTo())) {
                throw new IllegalArgumentException(
                        "Booking end time is after screen operating hours (" + screen.getActiveTo() + ")");
            }
        }

        // 5. Verification Check (Double Check)
        int conflictCount = bookingRepository.countConflictingBookings(
                request.getScreenId(),
                request.getStartDatetime(),
                request.getEndDatetime());

        if (conflictCount > 0) {
            throw new RuntimeException("Slot unavailable: Overlaps with an existing booking");
        }

        // 6. Calculate Price (Snapshot)
        Double price = pricingService.calculateAdvertiserPrice(
                screen,
                request.getStartDatetime(),
                request.getEndDatetime());

        // 6. Create Booking
        Booking booking = Booking.builder()
                .advertiserId(advertiserId)
                .screenId(screen.getId())
                .contentId(content.getId())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .status(BookingStatus.HELD)
                .expiresAt(LocalDateTime.now().plusMinutes(HOLD_DURATION_MINUTES))
                .priceAmount(price) // Save Snapshot
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created (HELD) for Screen {} by Advertiser {}. Price: {}", screen.getId(), advertiserId,
                price);

        return mapToResponse(savedBooking);
    }

    // Dynamic Availability Calculation
    public List<TimeRange> getAvailability(Long screenId, LocalDate date) {
        // 1. Get active bookings for the screen
        // We fetch all active bookings to be safe, though we could filter by date range
        // in SQL for optimization.
        // For now, let's filter in memory or add a specific repository method if
        // needed.
        // Assuming findActiveBookingsByScreen returns all future/current bookings.
        List<Booking> bookings = bookingRepository.findActiveBookingsByScreen(screenId);

        // Filter for specific date
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(23, 59, 59);

        // Sort bookings by start time
        List<Booking> dailyBookings = bookings.stream()
                .filter(b -> b.getEndDatetime().isAfter(dayStart) && b.getStartDatetime().isBefore(dayEnd))
                .sorted((b1, b2) -> b1.getStartDatetime().compareTo(b2.getStartDatetime()))
                .collect(Collectors.toList());

        List<TimeRange> freeRanges = new java.util.ArrayList<>();
        LocalDateTime currentCursor = dayStart;

        // If today, start cursor from now (if now is later than dayStart)
        if (date.equals(LocalDate.now())) {
            currentCursor = LocalDateTime.now();
            if (currentCursor.isAfter(dayEnd)) {
                return freeRanges; // Day is over
            }
        } else if (date.isBefore(LocalDate.now())) {
            return freeRanges; // Past date
        }

        for (Booking b : dailyBookings) {
            // Gap between cursor and booking start?
            if (b.getStartDatetime().isAfter(currentCursor)) {
                freeRanges.add(new TimeRange(currentCursor, b.getStartDatetime()));
            }
            // Move cursor to booking end (if it's later than current cursor)
            if (b.getEndDatetime().isAfter(currentCursor)) {
                currentCursor = b.getEndDatetime();
            }
        }

        // Final gap from last booking to end of day
        if (currentCursor.isBefore(dayEnd)) {
            freeRanges.add(new TimeRange(currentCursor, dayEnd));
        }

        return freeRanges;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class TimeRange {
        private LocalDateTime start;
        private LocalDateTime end;
    }

    public List<BookingResponse> getAdvertiserBookings(Long advertiserId) {
        return bookingRepository.findByAdvertiserId(advertiserId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getScreenBookings(Long screenId) {
        return bookingRepository.findActiveBookingsByScreen(screenId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .screenId(booking.getScreenId())
                .contentId(booking.getContentId())
                .startDatetime(booking.getStartDatetime())
                .endDatetime(booking.getEndDatetime())
                .status(booking.getStatus())
                .expiresAt(booking.getExpiresAt())
                .priceAmount(booking.getPriceAmount())
                .confirmedAt(booking.getConfirmedAt())
                .build();
    }
}
