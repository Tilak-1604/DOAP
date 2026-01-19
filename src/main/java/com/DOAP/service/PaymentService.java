package com.DOAP.service;

import com.DOAP.entity.Booking;
import com.DOAP.entity.Payment;
import com.DOAP.entity.enums.BookingStatus;
import com.DOAP.entity.enums.PaymentStatus;
import com.DOAP.repository.BookingRepository;
import com.DOAP.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final EarningsService earningsService;

    @Transactional
    public Payment processPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.HELD) {
            throw new RuntimeException("Booking is not in HELD state. Current status: " + booking.getStatus());
        }

        if (LocalDateTime.now().isAfter(booking.getExpiresAt())) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            throw new RuntimeException("Booking has expired");
        }

        // Mock Payment Logic - Always Success for now
        // In real world, call Gateway here.
        boolean paymentSuccess = true;

        Payment payment = Payment.builder()
                .bookingId(booking.getId())
                .amount(booking.getPriceAmount())
                .status(paymentSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED)
                .transactionReference(UUID.randomUUID().toString())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        if (paymentSuccess) {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setConfirmedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            log.info("Payment SUCCESS for Booking {}. Booking Confirmed.", bookingId);

            // Record Earnings separately
            earningsService.recordEarning(booking);

        } else {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            log.warn("Payment FAILED for Booking {}. Booking Cancelled.", bookingId);
        }

        return savedPayment;
    }
}
