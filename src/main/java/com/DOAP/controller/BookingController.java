package com.DOAP.controller;

import com.DOAP.dto.BookingRequest;
import com.DOAP.dto.BookingResponse;
import com.DOAP.entity.User;
import com.DOAP.repository.UserRepository;
import com.DOAP.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    private User getUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        } else if (principal instanceof String) {
            String email = (String) principal;
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        } else {
            throw new RuntimeException("Unknown principal type: " + principal.getClass().getName());
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request, Authentication authentication) {
        try {
            User user = getUser(authentication);
            BookingResponse response = bookingService.createBooking(request, user.getId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage()); // 409 Conflict for business rule violations
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Booking failed: " + e.getMessage());
        }
    }

    @GetMapping("/advertiser")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(bookingService.getAdvertiserBookings(user.getId()));
    }

    @GetMapping("/screen/{screenId}")
    public ResponseEntity<List<BookingResponse>> getScreenBookings(@PathVariable Long screenId) {
        return ResponseEntity.ok(bookingService.getScreenBookings(screenId));
    }

    @GetMapping("/availability")
    public ResponseEntity<?> getAvailability(
            @RequestParam Long screenId,
            @RequestParam String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            return ResponseEntity.ok(bookingService.getAvailability(screenId, localDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getUser(authentication);
            BookingResponse booking = bookingService.getBookingById(id);

            // Authorization: Only Advertiser (Owner of booking) or Admin
            boolean isAdvertiser = booking.getAdvertiserId().equals(user.getId());
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdvertiser && !isAdmin) {
                return ResponseEntity.status(403).build(); // Forbidden
            }

            // Check if booking is CONFIRMED
            if (booking.getStatus() != com.DOAP.entity.enums.BookingStatus.CONFIRMED) {
                return ResponseEntity.badRequest().body(null); // Invoice only for confirmed bookings
            }

            // Generate PDF
            byte[] pdfBytes = bookingService.generateInvoicePdf(id);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=invoice_" + id + ".pdf")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/screen/{screenId}/slots")
    public ResponseEntity<List<com.DOAP.service.BookingService.SlotStatus>> getSlotsStatus(
            @PathVariable Long screenId,
            @RequestParam String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            return ResponseEntity.ok(bookingService.getSlotsStatus(screenId, localDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
