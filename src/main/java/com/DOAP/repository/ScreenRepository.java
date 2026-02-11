package com.DOAP.repository;

import com.DOAP.entity.Screen;
import com.DOAP.entity.enums.ScreenStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

@Repository
public interface ScreenRepository extends JpaRepository<Screen, Long> {

        // Standard find methods
        List<Screen> findByOwnerId(Long ownerId);

        List<Screen> findByStatus(ScreenStatus status);

        long countByStatus(ScreenStatus status);

        // THREAD SAFETY: Pessimistic Lock
        // This locks the Screen row for the duration of the transaction.
        // Use this when creating bookings to ensure only one transaction can book this
        // screen at a time.
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT s FROM Screen s WHERE s.id = :id")
        Optional<Screen> findByIdWithLock(@Param("id") Long id);

        // Filter Screens by Time Range
        // Returns screens where (activeFrom <= requestedStart) AND (activeTo >=
        // requestedEnd)
        // AND Status is ACTIVE
        @Query("SELECT s FROM Screen s WHERE s.status = 'ACTIVE' AND " +
                        "(s.activeFrom IS NULL OR s.activeFrom <= :startTime) AND " +
                        "(s.activeTo IS NULL OR s.activeTo >= :endTime)")
        List<Screen> findScreensByTimeRange(@Param("startTime") java.time.LocalTime startTime,
                        @Param("endTime") java.time.LocalTime endTime);

        // Admin Queries
        // Count screens by owner role (ADMIN or SCREEN_OWNER)
        long countByOwnerRole(String ownerRole);

        // Find screens by owner role and status
        List<Screen> findByOwnerRoleAndStatus(String ownerRole, ScreenStatus status);

        // Find pending approval screens
        @Query("SELECT s FROM Screen s WHERE s.status = 'PENDING_APPROVAL' ORDER BY s.createdAt DESC")
        List<Screen> findPendingApprovalScreens();

        // Find all screens ordered by creation date (for admin view)
        @Query("SELECT s FROM Screen s ORDER BY s.createdAt DESC")
        List<Screen> findAllScreensOrderedByDate();
}
