package com.DOAP.controller;

import com.DOAP.dto.PlatformSettingsDTO;
import com.DOAP.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    private final PlatformSettingsService platformSettingsService;

    @GetMapping
    public ResponseEntity<PlatformSettingsDTO> getSettings() {
        PlatformSettingsDTO settings = platformSettingsService.getSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<PlatformSettingsDTO> updateSettings(@RequestBody PlatformSettingsDTO dto) {
        PlatformSettingsDTO updated = platformSettingsService.updateSettings(dto);
        return ResponseEntity.ok(updated);
    }
}
