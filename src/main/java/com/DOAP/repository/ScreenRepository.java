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

    // THREAD SAFETY: Pessimistic Lock
    // This locks the Screen row for the duration of the transaction.
    // Use this when creating bookings to ensure only one transaction can book this
    // screen at a time.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Screen s WHERE s.id = :id")
    Optional<Screen> findByIdWithLock(@Param("id") Long id);
}
