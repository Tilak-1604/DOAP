package com.DOAP.repository;

import com.DOAP.entity.Booking;
import com.DOAP.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

        Optional<Booking> findByBookingReference(String bookingReference);

        List<Booking> findByAdvertiserId(Long advertiserId);

        List<Booking> findByScreenId(Long screenId);

        List<Booking> findByScreenIdIn(List<Long> screenIds);

        List<Booking> findByContentId(Long contentId);

        // Find active bookings for a screen (HELD or CONFIRMED)
        @Query("SELECT b FROM Booking b WHERE b.screenId = :screenId AND b.status IN ('HELD', 'CONFIRMED')")
        List<Booking> findActiveBookingsByScreen(@Param("screenId") Long screenId);

        // CRITICAL: Conflict Check
        // Returns count of overlapping bookings that are HELD or CONFIRMED.
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        @Query(value = """
                        SELECT COUNT(*)
                        FROM bookings
                        WHERE screen_id = :screenId
                        AND `status` IN ('HELD', 'CONFIRMED')
                        AND :startDatetime < end_datetime
                        AND :endDatetime > start_datetime
                        """, nativeQuery = true)
        int countConflictingBookings(@Param("screenId") Long screenId,
                        @Param("startDatetime") LocalDateTime startDatetime,
                        @Param("endDatetime") LocalDateTime endDatetime);

        // Find expired bookings that are still stuck in HELD
        @Query("SELECT b FROM Booking b WHERE b.status = 'HELD' AND b.expiresAt < :now")
        List<Booking> findExpiredBookings(@Param("now") LocalDateTime now);

        // Admin Queries
        // Count bookings by status
        long countByStatus(BookingStatus status);

        // Calculate total revenue from all confirmed bookings
        @Query("SELECT COALESCE(SUM(b.priceAmount), 0.0) FROM Booking b WHERE b.status = 'CONFIRMED'")
        Double calculateTotalRevenue();

        // Get all bookings with pagination support (for admin view)
        @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
        List<Booking> findAllBookingsOrderedByDate();
}
