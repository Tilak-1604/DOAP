package com.DOAP.filter;

import com.DOAP.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Authentication Filter
 * Intercepts all requests, extracts JWT token from Authorization header,
 * validates it, and sets Authentication in SecurityContext
 * Runs before UsernamePasswordAuthenticationFilter
 */
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final com.DOAP.repository.UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, com.DOAP.repository.UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization"); // get the authorization header from the request because
                                                                // the token is sent in the authorization header

        // Check if Authorization header exists and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) { // if the authorization header exists and starts
                                                                      // with "Bearer "
            String token = authHeader.substring(7); // Remove "Bearer " prefix and get the token means the token is sent
                                                    // in the authorization header and we need to remove the "Bearer "
                                                    // prefix to get the token

            try {
                // Validate token means check if the token is valid
                log.info("Validating token: {}", token.substring(0, 10) + "...");
                if (jwtService.validateToken(token)) {
                    // Extract username (email) and roles from token
                    String username = jwtService.extractUsername(token);
                    List<String> roles = jwtService.extractRoles(token);
                    log.info("Token valid. User: {}, Roles from token: {}", username, roles);

                    // Load User entity to set as Principal (Important for Controller casting)
                    com.DOAP.entity.User user = userRepository.findByEmail(username).orElse(null);

                    if (user != null) {
                        // Convert roles to GrantedAuthority with ROLE_ prefix if missing
                        List<SimpleGrantedAuthority> authorities = roles.stream()
                                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());

                        log.info("Setting authentication for user {}: Authorities set from roles {}: {}",
                                username, roles, authorities);

                        // Create Authentication object with User entity as principal
                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                authorities);

                        // Set authentication in SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        log.warn("User {} not found in database even with valid token", username);
                    }
                } else {
                    log.warn("Token validation failed for token: {}", token.substring(0, 10) + "...");
                }
            } catch (Exception e) {
                log.error("Error during JWT filtering", e);
                // Invalid token - clear security context
                SecurityContextHolder.clearContext();
            }
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
