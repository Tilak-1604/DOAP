package com.DOAP.service;

import com.DOAP.dto.AdminBookingDetailsDTO;
import com.DOAP.entity.*;
import com.DOAP.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ScreenRepository screenRepository;
    private final ContentRepository contentRepository;
    private final AdBusinessDetailsRepository adBusinessDetailsRepository;

    public List<AdminBookingDetailsDTO> getAllBookings() {
        return bookingRepository.findAllBookingsOrderedByDate().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AdminBookingDetailsDTO convertToDTO(Booking booking) {
        // Fetch Advertiser
        User advertiser = userRepository.findById(booking.getAdvertiserId()).orElse(null);

        // Fetch Screen and its Owner
        Screen screen = screenRepository.findById(booking.getScreenId()).orElse(null);
        User screenOwner = null;
        if (screen != null) {
            screenOwner = userRepository.findById(screen.getOwnerId()).orElse(null);
        }

        // Fetch Content and Ad Details
        Content content = contentRepository.findById(booking.getContentId()).orElse(null);
        AdBusinessDetails adDetails = adBusinessDetailsRepository.findByContent_Id(booking.getContentId()).orElse(null);

        return AdminBookingDetailsDTO.builder()
                .id(booking.getId())
                .advertiserId(booking.getAdvertiserId())
                .advertiserName(advertiser != null ? advertiser.getName() : "Unknown")
                .advertiserEmail(advertiser != null ? advertiser.getEmail() : "Unknown")
                .screenId(booking.getScreenId())
                .screenName(screen != null ? screen.getScreenName() : "Unknown")
                .ownerId(screen != null ? screen.getOwnerId() : null)
                .ownerName(screenOwner != null ? screenOwner.getName()
                        : (screen != null && "ADMIN".equals(screen.getOwnerRole()) ? "DOAP Admin" : "Unknown"))
                .ownerEmail(screenOwner != null ? screenOwner.getEmail()
                        : (screen != null && "ADMIN".equals(screen.getOwnerRole()) ? "admin@doap.com" : "Unknown"))
                .contentId(booking.getContentId())
                .adTitle(adDetails != null ? adDetails.getAdTitle() : "Ad-" + booking.getContentId())
                .adS3Url(content != null ? content.getS3Url() : null)
                .adType(content != null ? content.getContentType().toString() : "IMAGE")
                .priceAmount(booking.getPriceAmount())
                .bookedAt(booking.getCreatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .status(booking.getStatus())
                .paymentStatus(booking.getConfirmedAt() != null ? "PAID" : "PENDING")
                .build();
    }
}
