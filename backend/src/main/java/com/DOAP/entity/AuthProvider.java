package com.DOAP.entity;

/**
 * Authentication Provider Enum
 * Indicates how the user authenticated (LOCAL or GOOGLE)
 */

//AuthProvider tells the system how a user authenticated (LOCAL or GOOGLE) and prevents auth-method confusion.
public enum AuthProvider { // this is an enum that defines the authentication providers means how the user authenticated means email/password or google oauth
    LOCAL,   // Email/password authentication
    GOOGLE   // Google OAuth authentication
}

