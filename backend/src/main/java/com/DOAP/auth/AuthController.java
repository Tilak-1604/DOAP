package com.DOAP.auth;

import com.DOAP.dto.GoogleLoginRequest;
import com.DOAP.dto.LoginRequest;
import com.DOAP.dto.LoginResponse;
import com.DOAP.dto.LogoutResponse;
import com.DOAP.dto.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login") // /auth/login @requestBody says json body to the request
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout() {
        // JWT is stateless - client must delete token
        // No server-side invalidation needed
        LogoutResponse response = new LogoutResponse("Logout successful. Please remove token from client.");
        return ResponseEntity.ok(response);
    }

    /**
     * Google OAuth Login
     * Endpoint: POST /auth/google
     * Verifies Google ID Token and returns DOAP JWT
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            if (request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Google ID Token is required");
            }

            LoginResponse response = authService.googleLogin(request.getIdToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Google authentication failed: " + e.getMessage());
        }
    }
}
