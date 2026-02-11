package com.DOAP.controller;

import com.DOAP.dto.ScreenOwnerBookingDTO;
import com.DOAP.dto.ScreenOwnerDashboardDTO;
import com.DOAP.dto.ScreenOwnerEarningsDTO;
import com.DOAP.dto.ScreenOwnerInsightsDTO;
import com.DOAP.dto.ScreenWithEarningsDTO;
import com.DOAP.entity.User;
import com.DOAP.repository.UserRepository;
import com.DOAP.service.ScreenOwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screen-owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SCREEN_OWNER')")
public class ScreenOwnerController {

    private final ScreenOwnerService screenOwnerService;
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

    @GetMapping("/debug/roles")
    public ResponseEntity<java.util.Map<String, Object>> debugRoles(Authentication authentication) {
        java.util.Map<String, Object> debugInfo = new java.util.HashMap<>();
        debugInfo.put("principal", authentication.getPrincipal().toString());
        debugInfo.put("authorities", authentication.getAuthorities());
        return ResponseEntity.ok(debugInfo);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ScreenOwnerDashboardDTO> getDashboardStats(Authentication authentication) {
        User user = getUser(authentication);
        ScreenOwnerDashboardDTO stats = screenOwnerService.getDashboardStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/screens")
    public ResponseEntity<List<ScreenWithEarningsDTO>> getScreensWithEarnings(Authentication authentication) {
        User user = getUser(authentication);
        List<ScreenWithEarningsDTO> screens = screenOwnerService.getScreensWithEarnings(user.getId());
        return ResponseEntity.ok(screens);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<ScreenOwnerBookingDTO>> getOwnerBookings(Authentication authentication) {
        User user = getUser(authentication);
        List<ScreenOwnerBookingDTO> bookings = screenOwnerService.getOwnerBookings(user.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/earnings")
    public ResponseEntity<ScreenOwnerEarningsDTO> getEarnings(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(screenOwnerService.getEarnings(user.getId()));
    }

    @GetMapping("/insights")
    public ResponseEntity<ScreenOwnerInsightsDTO> getInsights(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(screenOwnerService.getInsights(user.getId()));
    }
}
