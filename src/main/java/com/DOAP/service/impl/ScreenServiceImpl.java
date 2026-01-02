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

    @Override
    @Transactional
    public ScreenResponse addScreen(ScreenRequest request, Long userId, String role) {

        // Only ADMIN and SCREEN_OWNER can add screens
        if (!"ADMIN".equals(role) && !"SCREEN_OWNER".equals(role)) {
            throw new AccessDeniedException("You are not allowed to add screens");
        }

        Screen screen = Screen.builder()
                .screenName(request.getScreenName())
                .location(request.getLocation())
                .description(request.getDescription())
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
        } else {
            throw new AccessDeniedException("You are not allowed to view screens");
        }

        return screens.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ScreenResponse mapToResponse(Screen screen) {
        return ScreenResponse.builder()
                .id(screen.getId())
                .screenName(screen.getScreenName())
                .location(screen.getLocation())
                .description(screen.getDescription())
                .ownerId(screen.getOwnerId())
                .ownerRole(screen.getOwnerRole())
                .status(screen.getStatus())
                .createdAt(screen.getCreatedAt())
                .updatedAt(screen.getUpdatedAt())
                .build();
    }
}
