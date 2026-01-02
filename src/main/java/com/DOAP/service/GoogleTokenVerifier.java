package com.DOAP.service;

import com.google.auth.oauth2.TokenVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Google Token Verifier Service
 * Verifies Google ID Tokens server-side
 * Validates signature, issuer, audience, and expiration
 * DO NOT trust frontend tokens blindly - always verify server-side
 */
@Service
public class GoogleTokenVerifier {

    @Value("${google.client-id}")
    private String googleClientId;

    /**
     * Verify Google ID Token and extract user information
     *
     * @param idToken Google ID Token from frontend
     * @return GoogleUserInfo containing email, name, and email_verified status
     * @throws RuntimeException if token is invalid
     */
    public GoogleUserInfo verifyToken(String idToken) {
        try {
            // Verify token using Google's library
            TokenVerifier verifier = TokenVerifier.newBuilder()
                    .setAudience(googleClientId)  // Must match your Google OAuth client ID
                    .setIssuer("https://accounts.google.com")  // Google's issuer
                    .build();

            // Verify and get payload
            var payload = verifier.verify(idToken);

            // Extract user information
            String email = payload.getPayload().get("email").toString();
            String name = payload.getPayload().containsKey("name")
                    ? payload.getPayload().get("name").toString()
                    : email.split("@")[0];  // Fallback to email prefix if name not available
            Boolean emailVerified = payload.getPayload().containsKey("email_verified")
                    ? Boolean.parseBoolean(payload.getPayload().get("email_verified").toString())
                    : false;

            // Ensure email is verified
            if (!emailVerified) {
                throw new RuntimeException("Google email is not verified");
            }

            return new GoogleUserInfo(email, name, emailVerified);

        } catch (TokenVerifier.VerificationException e) {
            throw new RuntimeException("Invalid Google ID Token: " + e.getMessage(), e);
        }
    }

    /**
     * Inner class to hold verified Google user information
     */
    public static class GoogleUserInfo {
        private final String email;
        private final String name;
        private final boolean emailVerified;

        public GoogleUserInfo(String email, String name, boolean emailVerified) {
            this.email = email;
            this.name = name;
            this.emailVerified = emailVerified;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public boolean isEmailVerified() {
            return emailVerified;
        }
    }
}

