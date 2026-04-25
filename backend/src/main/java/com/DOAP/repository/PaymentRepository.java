package com.DOAP.repository;

import com.DOAP.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    java.util.List<Payment> findByBookingId(Long bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE p.bookingId IN (SELECT b.id FROM com.DOAP.entity.Booking b WHERE b.advertiserId = :advertiserId)")
    java.util.List<Payment> findByAdvertiserId(
            @org.springframework.data.repository.query.Param("advertiserId") Long advertiserId);
}
