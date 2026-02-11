package com.DOAP.service;

import com.DOAP.dto.UserManagementDTO;
import com.DOAP.entity.User;
import com.DOAP.entity.UserRole;
import com.DOAP.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserManagementService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final ScreenRepository screenRepository;
    private final OwnerEarningsRepository ownerEarningsRepository;
    private final BookingRepository bookingRepository;
    private final ContentRepository contentRepository;

    public List<UserManagementDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserManagementDTO)
                .collect(Collectors.toList());
    }

    public List<UserManagementDTO> getUsersByRole(String roleName) {
        return userRoleRepository.findAll().stream()
                .filter(ur -> ur.getRole().getRoleName().equals(roleName))
                .map(ur -> mapToUserManagementDTO(ur.getUser()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void activateUser(Long userId) {
        log.info("Activating user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void blockUser(Long userId) {
        log.info("Blocking user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    private UserManagementDTO mapToUserManagementDTO(User user) {
        List<String> roles = userRoleRepository.findAll().stream()
                .filter(ur -> ur.getUser().getId().equals(user.getId()))
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        UserManagementDTO dto = UserManagementDTO.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roles)
                .isActive(user.isActive())
                .build();

        // Add Screen Owner specific stats
        if (roles.contains("SCREEN_OWNER")) {
            Long numberOfScreens = (long) screenRepository.findByOwnerId(user.getId()).size();
            Double totalEarnings = ownerEarningsRepository.findByScreenOwnerId(user.getId()).stream()
                    .mapToDouble(e -> e.getOwnerAmount())
                    .sum();
            dto.setNumberOfScreens(numberOfScreens);
            dto.setTotalEarnings(totalEarnings);
        }

        // Add Advertiser specific stats
        if (roles.contains("ADVERTISER")) {
            Long adsUploaded = (long) contentRepository.findByUploaderId(user.getId()).size();
            Double totalSpend = bookingRepository.findByAdvertiserId(user.getId()).stream()
                    .mapToDouble(b -> b.getPriceAmount())
                    .sum();
            dto.setAdsUploaded(adsUploaded);
            dto.setTotalSpend(totalSpend);
        }

        return dto;
    }
}
