package com.DOAP.config;

import com.DOAP.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize and @PostAuthorize
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) // Enable CORS means cross-origin
                                                                                 // resource sharing
                .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless JWT API csrf means cross-site request
                                              // forgery means it prevents from unauthorized access to the api
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless - no sessions means no
                                                                                 // sessions are created or managed by
                                                                                 // the server
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/register", "/auth/login", "/auth/google").permitAll() // Public
                        .requestMatchers("/auth/logout").authenticated() // Logout requires authentication
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/screen-owner/**").hasRole("SCREEN_OWNER")
                        .anyRequest().authenticated() // All other endpoints require authentication
                )
                .httpBasic(httpBasic -> httpBasic.disable()) // Disable basic auth // browser and spring nu security ny
                                                             // ave ee chhe
                .formLogin(formLogin -> formLogin.disable()) // Disable form login
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Add JWT filter
                                                                                                       // means at the
                                                                                                       // beginning of
                                                                                                       // the filter
                                                                                                       // chain means
                                                                                                       // the jwt
                                                                                                       // authentication
                                                                                                       // filter is
                                                                                                       // executed
                                                                                                       // before the
                                                                                                       // username
                                                                                                       // password
                                                                                                       // authentication
                                                                                                       // filter

        return http.build();
    }
}
