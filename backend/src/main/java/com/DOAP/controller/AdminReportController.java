package com.DOAP.controller;

import com.DOAP.dto.AdminPlatformSummaryDTO;
import com.DOAP.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/summary")
    public ResponseEntity<AdminPlatformSummaryDTO> getPlatformSummary() {
        return ResponseEntity.ok(adminReportService.getPlatformSummary());
    }

    @GetMapping("/export/bookings")
    public ResponseEntity<byte[]> exportBookings(
            @RequestParam String start,
            @RequestParam String end) {

        LocalDateTime startTime = parseDateTime(start);
        LocalDateTime endTime = parseDateTime(end);

        String csv = adminReportService.generateBookingReport(startTime, endTime);
        byte[] bytes = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/export/revenue")
    public ResponseEntity<byte[]> exportRevenue(
            @RequestParam String start,
            @RequestParam String end) {

        LocalDateTime startTime = parseDateTime(start);
        LocalDateTime endTime = parseDateTime(end);

        String csv = adminReportService.generateRevenueReport(startTime, endTime);
        byte[] bytes = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=revenue_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    private LocalDateTime parseDateTime(String dt) {
        try {
            // Handle YYYY-MM-DDTHH:MM
            if (dt.length() == 16) {
                return LocalDateTime.parse(dt + ":00");
            }
            return LocalDateTime.parse(dt);
        } catch (Exception e) {
            return LocalDateTime.now(); // Fallback
        }
    }
}
