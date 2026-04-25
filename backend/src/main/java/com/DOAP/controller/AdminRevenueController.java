package com.DOAP.controller;

import com.DOAP.dto.RevenueBreakdownDTO;
import com.DOAP.service.AdminRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/revenue")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRevenueController {

    private final AdminRevenueService adminRevenueService;

    @GetMapping("/breakdown")
    public ResponseEntity<RevenueBreakdownDTO> getRevenueBreakdown() {
        RevenueBreakdownDTO breakdown = adminRevenueService.getRevenueBreakdown();
        return ResponseEntity.ok(breakdown);
    }
}
