package com.DOAP.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test Controller for Role-Based Authorization Testing
 * Demonstrates @PreAuthorize with different roles
 * Used to verify JWT authentication and role-based access control
 */
@RestController
@RequestMapping("/test")
public class TestController {

    /**
     * ADMIN-only endpoint
     * Only users with ADMIN role can access
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminEndpoint() {
        return ResponseEntity.ok("This is an ADMIN-only endpoint. Access granted!");
    }

    /**
     * SCREEN_OWNER-only endpoint
     * Only users with SCREEN_OWNER role can access
     */
    @GetMapping("/owner")
    @PreAuthorize("hasRole('SCREEN_OWNER')")
    public ResponseEntity<String> ownerEndpoint() {
        return ResponseEntity.ok("This is a SCREEN_OWNER-only endpoint. Access granted!");
    }

    /**
     * ADVERTISER-only endpoint
     * Only users with ADVERTISER role can access
     */
    @GetMapping("/advertiser")
    @PreAuthorize("hasRole('ADVERTISER')")
    public ResponseEntity<String> advertiserEndpoint() {
        return ResponseEntity.ok("This is an ADVERTISER-only endpoint. Access granted!");
    }

    /**
     * Public endpoint
     * Accessible to all authenticated users (any role)
     */
    @GetMapping("/public")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("This is a public endpoint. Any authenticated user can access!");
    }
}

