package com.DOAP.controller;

import com.DOAP.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final com.DOAP.repository.UserRepository userRepository;

    private com.DOAP.entity.User getUser(org.springframework.security.core.Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.DOAP.entity.User) {
            return (com.DOAP.entity.User) principal;
        } else if (principal instanceof String) {
            String email = (String) principal;
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        } else {
            throw new RuntimeException("Unknown principal type: " + principal.getClass().getName());
        }
    }

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @GetMapping("/razorpay-key")
    public ResponseEntity<?> getRazorpayKey() {
        return ResponseEntity.ok(java.util.Map.of("key", razorpayKeyId));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestParam Long bookingId) {
        try {
            java.util.Map<String, Object> orderResponse = paymentService.createOrder(bookingId);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Order Creation Failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody java.util.Map<String, Object> data) {
        try {
            String razorpayOrderId = (String) data.get("razorpay_order_id");
            String razorpayPaymentId = (String) data.get("razorpay_payment_id");
            String razorpaySignature = (String) data.get("razorpay_signature");
            Long bookingId = Long.valueOf(data.get("booking_id").toString());

            boolean verified = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature,
                    bookingId);

            if (verified) {
                return ResponseEntity.ok("Payment Verified");
            } else {
                return ResponseEntity.badRequest().body("Verification Failed");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment Verification Failed: " + e.getMessage());
        }
    }

    @GetMapping("/my-history")
    public ResponseEntity<?> getMyHistory(org.springframework.security.core.Authentication authentication) {
        try {
            com.DOAP.entity.User user = getUser(authentication); // Needed helper method
            return ResponseEntity.ok(paymentService.getAdvertiserPayments(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to fetch payment history");
        }
    }

    // Helper method duplicated here or should be in a base class/util.
    // Since I can't easily refactor to base class now, I'll inject UserRepository
    // and duplicate getUser logic or just cast if I'm sure.
    // Better to inject UserRepository.
}
