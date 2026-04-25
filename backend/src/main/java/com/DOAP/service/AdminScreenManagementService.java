package com.DOAP.service;

import com.DOAP.dto.AdminScreenDetailsDTO;
import com.DOAP.entity.Screen;
import com.DOAP.entity.User;
import com.DOAP.entity.enums.ScreenStatus;
import com.DOAP.entity.enums.ScreenType;
import com.DOAP.repository.ScreenRepository;
import com.DOAP.repository.UserRepository;
import com.DOAP.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminScreenManagementService {

    private final ScreenRepository screenRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<AdminScreenDetailsDTO> getAllScreens() {
        return screenRepository.findAllScreensOrderedByDate().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AdminScreenDetailsDTO> getPendingApprovalScreens() {
        return screenRepository.findPendingApprovalScreens().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AdminScreenDetailsDTO> getDoapScreens() {
        return screenRepository.findByOwnerRoleAndStatus("ADMIN", ScreenStatus.ACTIVE).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AdminScreenDetailsDTO convertToDTO(Screen screen) {
        User owner = userRepository.findById(screen.getOwnerId()).orElse(null);
        return AdminScreenDetailsDTO.builder()
                .id(screen.getId())
                .screenName(screen.getScreenName())
                .location(screen.getLocation())
                .city(screen.getCity())
                .ownerId(screen.getOwnerId())
                .ownerRole(screen.getOwnerRole())
                .ownerName(owner != null ? owner.getName() : "Unknown")
                .ownerEmail(owner != null ? owner.getEmail() : "Unknown")
                .status(screen.getStatus())
                .pricePerHour(screen.getPricePerHour())
                .screenType(screen.getScreenType())
                .createdAt(screen.getCreatedAt())
                .build();
    }

    @Transactional
    public Screen addDoapScreen(Screen screen) {
        log.info("Admin adding DOAP-owned screen: {}", screen.getScreenName());

        // Get current admin user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long adminId = userService.findByEmail(email).getId();

        // Set DOAP ownership
        screen.setOwnerId(adminId);
        screen.setOwnerRole("ADMIN");
        screen.setCreatedBy(adminId);
        screen.setStatus(ScreenStatus.ACTIVE); // DOAP screens are auto-approved
        screen.setApprovedBy(adminId);
        screen.setApprovedAt(LocalDateTime.now());

        return screenRepository.save(screen);
    }

    @Transactional
    public void approveScreen(Long screenId) {
        log.info("Approving screen: {}", screenId);

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long adminId = userService.findByEmail(email).getId();

        screen.setStatus(ScreenStatus.ACTIVE);
        screen.setApprovedBy(adminId);
        screen.setApprovedAt(LocalDateTime.now());

        screenRepository.save(screen);
    }

    @Transactional
    public void rejectScreen(Long screenId) {
        log.info("Rejecting screen: {}", screenId);

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        screen.setStatus(ScreenStatus.REJECTED);
        screenRepository.save(screen);
    }

    @Transactional
    public void suspendScreen(Long screenId) {
        log.info("Suspending screen: {}", screenId);

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        screen.setStatus(ScreenStatus.INACTIVE);
        screenRepository.save(screen);
    }
}
