package com.DOAP.controller;

import com.DOAP.dto.ScreenApprovalRequest;
import com.DOAP.dto.ScreenRequest;
import com.DOAP.dto.ScreenResponse;
import com.DOAP.entity.User;
import com.DOAP.service.ScreenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
@RequiredArgsConstructor
public class ScreenController {

    private final ScreenService screenService;
    private final com.DOAP.repository.UserRepository userRepository;

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
    @PreAuthorize("hasAnyRole('ADMIN', 'SCREEN_OWNER')")
    public ResponseEntity<ScreenResponse> addScreen(
            @Valid @RequestBody ScreenRequest request,
            Authentication authentication) {

        User user = getUser(authentication);

        // Extract role string (ADMIN or SCREEN_OWNER)
        String role = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .filter(r -> "ADMIN".equals(r) || "SCREEN_OWNER".equals(r))
                .findFirst()
                .orElse("SCREEN_OWNER"); // Default fallback if needed

        ScreenResponse response = screenService.addScreen(
                request,
                user.getId(),
                role);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCREEN_OWNER', 'ADVERTISER')")
    public ResponseEntity<List<ScreenResponse>> getAllScreens(
            Authentication authentication) {

        User user = getUser(authentication);

        // Extract role string
        String role = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .filter(r -> "ADMIN".equals(r) || "SCREEN_OWNER".equals(r) || "ADVERTISER".equals(r))
                .findFirst()
                .orElse("ADVERTISER");

        List<ScreenResponse> screens = screenService.getAllScreens(user.getId(), role);
        return ResponseEntity.ok(screens);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCREEN_OWNER', 'ADVERTISER')")
    public ResponseEntity<ScreenResponse> getScreenById(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getUser(authentication);
        String role = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("ADVERTISER");

        ScreenResponse response = screenService.getScreenById(id, user.getId(), role);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScreenResponse> approveScreen(
            @PathVariable Long id,
            @Valid @RequestBody ScreenApprovalRequest request,
            Authentication authentication) {

        User admin = getUser(authentication);

        // We know it is ADMIN due to @PreAuthorize
        String role = "ADMIN";

        ScreenResponse response = screenService.approveScreen(
                id,
                request,
                admin.getId(),
                role);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCREEN_OWNER')")
    public ResponseEntity<ScreenResponse> updateScreen(
            @PathVariable Long id,
            @Valid @RequestBody ScreenRequest request,
            Authentication authentication) {

        User user = getUser(authentication);

        // Extract role string (ADMIN or SCREEN_OWNER)
        String role = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .filter(r -> "ADMIN".equals(r) || "SCREEN_OWNER".equals(r))
                .findFirst()
                .orElse("SCREEN_OWNER");

        ScreenResponse response = screenService.updateScreen(id, request, user.getId(), role);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCREEN_OWNER')")
    public ResponseEntity<ScreenResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody com.DOAP.dto.ScreenStatusRequest request,
            Authentication authentication) {

        User user = getUser(authentication);

        // Extract role string (ADMIN or SCREEN_OWNER)
        String role = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .filter(r -> "ADMIN".equals(r) || "SCREEN_OWNER".equals(r))
                .findFirst()
                .orElse("SCREEN_OWNER");

        ScreenResponse response = screenService.updateScreenStatus(id, request.getStatus(), user.getId(), role);
        return ResponseEntity.ok(response);
    }
}
