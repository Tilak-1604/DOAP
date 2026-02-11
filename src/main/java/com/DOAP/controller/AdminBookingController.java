package com.DOAP.controller;

import com.DOAP.dto.AdminBookingDetailsDTO;
import com.DOAP.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    public ResponseEntity<List<AdminBookingDetailsDTO>> getAllBookings() {
        List<AdminBookingDetailsDTO> bookings = adminBookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
}
