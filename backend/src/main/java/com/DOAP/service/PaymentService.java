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
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final EarningsService earningsService;
    private final PricingService pricingService;
    private final com.DOAP.service.EmailService emailService;
    private final com.DOAP.repository.ScreenRepository screenRepository;
    private final com.DOAP.repository.UserRepository userRepository;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            if (keyId != null && !keyId.startsWith("${razorpay.key.id}")) {
                this.razorpayClient = new RazorpayClient(keyId, keySecret);
            }
        } catch (Exception e) {
            log.warn("Failed to initialize Razorpay Client: {}", e.getMessage());
        }
    }

    public java.util.Map<String, Object> createOrder(Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (booking.getStatus() != BookingStatus.HELD) {
                throw new RuntimeException("Booking is not in HELD state");
            }

            if (razorpayClient == null) {
                throw new RuntimeException("Payment gateway not configured");
            }

            JSONObject orderRequest = new JSONObject();
            // Amount in paise
            orderRequest.put("amount", (int) (booking.getPriceAmount() * 100));
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "booking_" + bookingId);

            Order order = razorpayClient.orders.create(orderRequest);

            // Return a proper Map instead of Order.toString()
            java.util.Map<String, Object> orderResponse = new java.util.HashMap<>();
            orderResponse.put("id", order.get("id"));
            orderResponse.put("amount", order.get("amount"));
            orderResponse.put("currency", order.get("currency"));
            orderResponse.put("receipt", order.get("receipt"));

            return orderResponse;

        } catch (Exception e) {
            log.error("Razorpay Order Creation Failed", e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
    }

    @Transactional
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature,
            Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Verify Signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = com.razorpay.Utils.verifyPaymentSignature(options, keySecret);

            if (isValid) {
                // If booking status is EXPIRED, double check availability before confirming
                if (booking.getStatus() == BookingStatus.EXPIRED) {
                    log.warn("Payment received for EXPIRED booking ID: {}. Checking for conflicts...", bookingId);
                    int conflicts = bookingRepository.countConflictingBookings(
                            booking.getScreenId(),
                            booking.getStartDatetime(),
                            booking.getEndDatetime());

                    if (conflicts > 0) {
                        log.error("Slot already taken for EXPIRED booking ID: {}", bookingId);
                        throw new RuntimeException(
                                "Payment successful but slot was taken. Please contact support for refund.");
                    }
                    log.info("Slot still available. Reviving Booking ID: {}", bookingId);
                }

                if (booking.getStatus() == BookingStatus.CONFIRMED) {
                    log.info("Booking ID: {} is already CONFIRMED. Idempotent success.", bookingId);
                    return true;
                }

                // Update Booking
                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setConfirmedAt(LocalDateTime.now());
                bookingRepository.save(booking);

                // Record Payment
                Payment payment = Payment.builder()
                        .bookingId(bookingId)
                        .amount(booking.getPriceAmount())
                        .status(PaymentStatus.SUCCESS)
                        .transactionReference(razorpayPaymentId) // Store Razorpay Payment ID
                        .build();
                paymentRepository.save(payment);

                // Record Earnings
                earningsService.recordEarning(booking);

                // Send Confirmation Emails
                try {
                    com.DOAP.entity.User advertiser = userRepository.findById(booking.getAdvertiserId()).orElse(null);
                    com.DOAP.entity.Screen screen = screenRepository.findById(booking.getScreenId()).orElse(null);

                    if (advertiser != null && screen != null) {
                        // Get Owner Email
                        String ownerEmail = userRepository.findById(screen.getOwnerId())
                                .map(com.DOAP.entity.User::getEmail)
                                .orElse("Unknown");

                        log.info("Preparing to send booking confirmation. Advertiser: {}, Owner: {}, Amount: {}",
                                advertiser.getEmail(), ownerEmail, booking.getPriceAmount());

                        Double validOwnerEarning = pricingService.calculateOwnerEarning(screen,
                                booking.getStartDatetime(), booking.getEndDatetime());

                        try {
                            emailService.sendBookingConfirmationEmail(
                                    advertiser.getEmail(),
                                    ownerEmail,
                                    booking,
                                    screen,
                                    booking.getPriceAmount(),
                                    validOwnerEarning);
                            log.info("Booking confirmation email sent successfully.");
                        } catch (Exception e) {
                            log.error("Error inside emailService.sendBookingConfirmationEmail", e);
                        }
                    } else {
                        log.warn("Skipping email: Advertiser or Screen not found. BookingID: {}", bookingId);
                    }
                } catch (Exception e) {
                    log.error("Failed to execute email logic for BookingID: " + bookingId, e);
                }

                log.info("Payment Verified and Booking Confirmed for ID: {}", bookingId);
                return true;
            } else {
                log.error("Payment Signature Verification Failed for Booking ID: {}", bookingId);
                return false;
            }

        } catch (RuntimeException e) {
            if (e.getMessage().equals("Booking not found")) {
                log.error("Payment received for DELETED/EXPIRED booking ID: {}", bookingId);
                throw new RuntimeException("Booking has expired and was removed. Please restart booking.");
            }
            throw e;
        } catch (Exception e) {
            log.error("Payment Verification Error", e);
            throw new RuntimeException("Payment verification failed");
        }
    }

    public java.util.List<Payment> getAdvertiserPayments(Long advertiserId) {
        return paymentRepository.findByAdvertiserId(advertiserId);
    }
}
