package com.DOAP.dto;

/**
 * DTO for Google Login Request
 * Contains the Google ID Token received from frontend
 * Used in POST /auth/google endpoint
 */
public class GoogleLoginRequest { // this A DTO that carries only Google ID token from frontend to backend.

    private String idToken; // frontend send token id and backend verify it

    public GoogleLoginRequest() {
    }

    public GoogleLoginRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}

