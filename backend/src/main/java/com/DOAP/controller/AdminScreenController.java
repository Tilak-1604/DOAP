package com.DOAP.controller;

import com.DOAP.dto.AdminScreenDetailsDTO;
import com.DOAP.entity.Screen;
import com.DOAP.service.AdminScreenManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/screens")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminScreenController {

    private final AdminScreenManagementService adminScreenManagementService;

    @GetMapping
    public ResponseEntity<List<AdminScreenDetailsDTO>> getAllScreens() {
        log.info("AdminScreenController: Fetching all screens for admin");
        List<AdminScreenDetailsDTO> screens = adminScreenManagementService.getAllScreens();
        return ResponseEntity.ok(screens);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AdminScreenDetailsDTO>> getPendingApprovalScreens() {
        List<AdminScreenDetailsDTO> screens = adminScreenManagementService.getPendingApprovalScreens();
        return ResponseEntity.ok(screens);
    }

    @GetMapping("/doap")
    public ResponseEntity<List<AdminScreenDetailsDTO>> getDoapScreens() {
        List<AdminScreenDetailsDTO> screens = adminScreenManagementService.getDoapScreens();
        return ResponseEntity.ok(screens);
    }

    @PostMapping("/doap")
    public ResponseEntity<Screen> addDoapScreen(@RequestBody Screen screen) {
        Screen createdScreen = adminScreenManagementService.addDoapScreen(screen);
        return ResponseEntity.ok(createdScreen);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveScreen(@PathVariable Long id) {
        adminScreenManagementService.approveScreen(id);
        return ResponseEntity.ok("Screen approved successfully");
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectScreen(@PathVariable Long id) {
        adminScreenManagementService.rejectScreen(id);
        return ResponseEntity.ok("Screen rejected successfully");
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<String> suspendScreen(@PathVariable Long id) {
        adminScreenManagementService.suspendScreen(id);
        return ResponseEntity.ok("Screen suspended successfully");
    }
}
