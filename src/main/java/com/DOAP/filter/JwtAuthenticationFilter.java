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
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization"); // get the authorization header from the request because the token is sent in the authorization header

        // Check if Authorization header exists and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) { // if the authorization header exists and starts with "Bearer "
            String token = authHeader.substring(7); // Remove "Bearer " prefix and get the token means the token is sent in the authorization header and we need to remove the "Bearer " prefix to get the token

            try {
                // Validate token means check if the token is valid
                if (jwtService.validateToken(token)) {
                    // Extract username and roles from token
                    String username = jwtService.extractUsername(token);
                    List<String> roles = jwtService.extractRoles(token);

                    // Convert roles to GrantedAuthority with ROLE_ prefix
                    // Spring Security expects roles to have ROLE_ prefix for hasRole() checks
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                            .collect(Collectors.toList());

                    // Create Authentication object
                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );

                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Invalid token - clear security context
                SecurityContextHolder.clearContext();
            }
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}

