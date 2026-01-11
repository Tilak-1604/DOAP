package com.DOAP.service.impl;

import com.DOAP.dto.ScreenApprovalRequest;
import com.DOAP.dto.ScreenRequest;
import com.DOAP.dto.ScreenResponse;
import com.DOAP.entity.Screen;
import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.repository.ScreenRepository;
import com.DOAP.service.ScreenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreenServiceImpl implements ScreenService {

    private final ScreenRepository screenRepository;
    private final com.DOAP.repository.UserRepository userRepository;

    @Override
    @Transactional
    public ScreenResponse addScreen(ScreenRequest request, Long userId, String role) {

        // Only ADMIN and SCREEN_OWNER can add screens
        if (!"ADMIN".equals(role) && !"SCREEN_OWNER".equals(role)) {
            throw new AccessDeniedException("You are not allowed to add screens");
        }

        Screen screen = Screen.builder()
                .screenName(request.getScreenName())
                .description(request.getDescription())
                // Location mappings
                .location(constructLocationString(request)) // Composite string for legacy compat
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .pincode(request.getPincode())
                .category(request.getCategory())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                // Tech mappings
                .screenType(request.getScreenType())
                .orientation(request.getOrientation())
                .screenWidth(request.getScreenWidth())
                .screenHeight(request.getScreenHeight())
                .resolutionWidth(request.getResolutionWidth())
                .resolutionHeight(request.getResolutionHeight())
                .activeFrom(request.getActiveFrom())
                .activeTo(request.getActiveTo())
                // Ownership
                .ownerId(userId)
                .ownerRole(role)
                .status(ScreenStatus.INACTIVE) // Pending admin approval
                .createdBy(userId)
                .build();

        Screen savedScreen = screenRepository.save(screen);
        return mapToResponse(savedScreen);
    }

    @Override
    @Transactional
    public ScreenResponse approveScreen(
            Long screenId,
            ScreenApprovalRequest request,
            Long adminId,
            String role) {

        // Only ADMIN can approve or reject screens
        if (!"ADMIN".equals(role)) {
            throw new AccessDeniedException("Only admin can approve screens");
        }

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found with ID: " + screenId));

        // Only allow ACTIVE or REJECTED during approval
        if (request.getStatus() != ScreenStatus.ACTIVE &&
                request.getStatus() != ScreenStatus.REJECTED) {
            throw new IllegalArgumentException("Only ACTIVE or REJECTED status allowed");
        }

        screen.setStatus(request.getStatus());
        screen.setApprovedBy(adminId);
        screen.setApprovedAt(LocalDateTime.now());

        Screen savedScreen = screenRepository.save(screen);
        return mapToResponse(savedScreen);
    }

    @Override
    public List<ScreenResponse> getAllScreens(Long userId, String role) {
        List<Screen> screens;

        if ("ADMIN".equals(role)) {
            // Admin can see all screens
            screens = screenRepository.findAll();
        } else if ("SCREEN_OWNER".equals(role)) {
            // Screen Owner can only see their own screens
            screens = screenRepository.findByOwnerId(userId);
        } else if ("ADVERTISER".equals(role)) {
            // Advertiser can only see ACTIVE screens
            screens = screenRepository.findAll().stream()
                    .filter(s -> s.getStatus() == ScreenStatus.ACTIVE)
                    .collect(Collectors.toList());
        } else {
            throw new AccessDeniedException("You are not allowed to view screens");
        }

        return screens.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ScreenResponse getScreenById(Long screenId, Long userId, String role) {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        if ("ADVERTISER".equals(role)) {
            if (screen.getStatus() != ScreenStatus.ACTIVE) {
                throw new AccessDeniedException("Screen is not active");
            }
        } else if ("SCREEN_OWNER".equals(role)) {
            if (!screen.getOwnerId().equals(userId)) {
                throw new AccessDeniedException("You do not own this screen");
            }
        }
        // Admin can see everything

        return mapToResponse(screen);
    }

    @Override
    @Transactional
    public ScreenResponse updateScreen(Long screenId, ScreenRequest request, Long userId, String role) {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found with ID: " + screenId));

        // Ownership Check
        validateOwnership(screen, userId, role);

        // Update Editable Fields
        if (request.getScreenName() != null)
            screen.setScreenName(request.getScreenName());
        if (request.getDescription() != null)
            screen.setDescription(request.getDescription());
        if (request.getAddress() != null)
            screen.setAddress(request.getAddress());
        if (request.getCategory() != null)
            screen.setCategory(request.getCategory());

        // Update Lat/Long if provided
        if (request.getLatitude() != null)
            screen.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            screen.setLongitude(request.getLongitude());

        // Reconstruct composite location string using NEW address and OLD city/pincode
        // (Since City and Pincode are non-editable)
        String newAddress = request.getAddress() != null ? request.getAddress() : screen.getAddress();
        screen.setLocation(constructLocationWithComponents(newAddress, screen.getCity(), screen.getPincode()));

        Screen savedScreen = screenRepository.save(screen);
        return mapToResponse(savedScreen);
    }

    @Override
    @Transactional
    public ScreenResponse updateScreenStatus(Long screenId, ScreenStatus status, Long userId, String role) {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found with ID: " + screenId));

        // Ownership Check
        validateOwnership(screen, userId, role);

        // Validation: Cannot set REJECTED manually
        if (status == ScreenStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Cannot manually set status to REJECTED. Only Admin can reject via approval flow.");
        }

        screen.setStatus(status);
        Screen savedScreen = screenRepository.save(screen);
        return mapToResponse(savedScreen);
    }

    private void validateOwnership(Screen screen, Long userId, String role) {
        if ("SCREEN_OWNER".equals(role)) {
            if (!screen.getOwnerId().equals(userId)) {
                throw new AccessDeniedException("You can only edit your own screens");
            }
        } else if ("ADMIN".equals(role)) {
            // Admin can edit only admin-owned screens
            if (!"ADMIN".equals(screen.getOwnerRole())) {
                throw new AccessDeniedException("Admin cannot edit Screen Owner's screens");
            }
        } else {
            throw new AccessDeniedException("Unauthorized action");
        }
    }

    private ScreenResponse mapToResponse(Screen screen) {
        String ownerName = "Unknown";
        String ownerEmail = "Unknown";

        if (screen.getOwnerId() != null) {
            com.DOAP.entity.User user = userRepository.findById(screen.getOwnerId()).orElse(null);
            if (user != null) {
                ownerName = user.getName();
                ownerEmail = user.getEmail();
            }
        }

        return ScreenResponse.builder()
                .id(screen.getId())
                .screenName(screen.getScreenName())
                .description(screen.getDescription())
                // Location
                .location(screen.getLocation())
                .address(screen.getAddress())
                .city(screen.getCity())
                .state(screen.getState())
                .country(screen.getCountry())
                .pincode(screen.getPincode())
                .category(screen.getCategory())
                .latitude(screen.getLatitude())
                .longitude(screen.getLongitude())
                // Tech
                .screenType(screen.getScreenType())
                .orientation(screen.getOrientation())
                .screenWidth(screen.getScreenWidth())
                .screenHeight(screen.getScreenHeight())
                .resolutionWidth(screen.getResolutionWidth())
                .resolutionHeight(screen.getResolutionHeight())
                .activeFrom(screen.getActiveFrom())
                .activeTo(screen.getActiveTo())
                // Meta
                .ownerId(screen.getOwnerId())
                .ownerName(ownerName)
                .ownerEmail(ownerEmail)
                .ownerRole(screen.getOwnerRole())
                .status(screen.getStatus())
                .createdAt(screen.getCreatedAt())
                .updatedAt(screen.getUpdatedAt())
                .build();
    }

    private String constructLocationString(ScreenRequest request) {
        return constructLocationWithComponents(request.getAddress(), request.getCity(), request.getPincode());
    }

    private String constructLocationWithComponents(String address, String city, String pincode) {
        StringBuilder sb = new StringBuilder();
        if (address != null)
            sb.append(address);
        if (city != null)
            sb.append(", ").append(city);
        if (pincode != null)
            sb.append(" - ").append(pincode);
        return sb.toString();
    }
}
