package com.DOAP.dto;

/**
 * DTO for login response
 * Returns JWT token with metadata
 */
public class LoginResponse {

    private String token;
    private String type = "Bearer";
    private Long expiresIn; // in seconds

    public LoginResponse() {
    }

    public LoginResponse(String token, Long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
}

