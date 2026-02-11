package com.DOAP.controller;

import com.DOAP.dto.UserManagementDTO;
import com.DOAP.service.AdminUserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserManagementService adminUserManagementService;

    @GetMapping
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        List<UserManagementDTO> users = adminUserManagementService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/by-role/{role}")
    public ResponseEntity<List<UserManagementDTO>> getUsersByRole(@PathVariable String role) {
        List<UserManagementDTO> users = adminUserManagementService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<String> activateUser(@PathVariable Long id) {
        adminUserManagementService.activateUser(id);
        return ResponseEntity.ok("User activated successfully");
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<String> blockUser(@PathVariable Long id) {
        adminUserManagementService.blockUser(id);
        return ResponseEntity.ok("User blocked successfully");
    }
}
