package com.DOAP.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()  // Allow all auth endpoints without authentication
                        .anyRequest().permitAll()  // Temporarily allow all endpoints (change to .authenticated() later)
                )
                .csrf(csrf -> csrf.disable())  // Disable CSRF for API endpoints
                .httpBasic(httpBasic -> httpBasic.disable())  // Disable basic auth
                .formLogin(formLogin -> formLogin.disable());  // Disable form login

        return http.build();
    }
}

