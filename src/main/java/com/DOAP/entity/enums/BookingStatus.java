package com.DOAP.entity.enums;

public enum BookingStatus {
    CREATED, // Booking intent created, content approved, but not yet held
    HELD, // Slot locked temporarily (e.g. for 15 mins) waiting for payment/final
          // confirmation
    CONFIRMED, // Reserved indefinitely (payment success or manual admin confirmation)
    CANCELLED, // Manually cancelled by user or admin
    EXPIRED // Auto-timeout from HELD state
}
