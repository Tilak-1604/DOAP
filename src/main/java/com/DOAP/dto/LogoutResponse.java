package com.DOAP.dto;

/**
 * DTO for logout response
 * Returns a message instructing client to remove the token
 */
public class LogoutResponse {

    private String message;

    public LogoutResponse() {
    }

    public LogoutResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

