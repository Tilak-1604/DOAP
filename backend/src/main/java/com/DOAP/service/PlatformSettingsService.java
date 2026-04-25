package com.DOAP.service;

import com.DOAP.dto.PlatformSettingsDTO;
import com.DOAP.entity.PlatformSettings;
import com.DOAP.repository.PlatformSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformSettingsService {

    private final PlatformSettingsRepository platformSettingsRepository;

    public PlatformSettingsDTO getSettings() {
        PlatformSettings settings = platformSettingsRepository.findById(1L)
                .orElseGet(() -> createDefaultSettings());

        return PlatformSettingsDTO.builder()
                .commissionPercentage(settings.getCommissionPercentage())
                .minimumBookingDurationMinutes(settings.getMinimumBookingDurationMinutes())
                .maintenanceMode(settings.getMaintenanceMode())
                .autoApproveScreens(settings.getAutoApproveScreens())
                .build();
    }

    @Transactional
    public PlatformSettingsDTO updateSettings(PlatformSettingsDTO dto) {
        log.info("Updating platform settings");

        PlatformSettings settings = platformSettingsRepository.findById(1L)
                .orElseGet(() -> createDefaultSettings());

        if (dto.getCommissionPercentage() != null) {
            settings.setCommissionPercentage(dto.getCommissionPercentage());
        }
        if (dto.getMinimumBookingDurationMinutes() != null) {
            settings.setMinimumBookingDurationMinutes(dto.getMinimumBookingDurationMinutes());
        }
        if (dto.getMaintenanceMode() != null) {
            settings.setMaintenanceMode(dto.getMaintenanceMode());
        }
        if (dto.getAutoApproveScreens() != null) {
            settings.setAutoApproveScreens(dto.getAutoApproveScreens());
        }

        platformSettingsRepository.save(settings);
        return getSettings();
    }

    private PlatformSettings createDefaultSettings() {
        PlatformSettings settings = PlatformSettings.builder()
                .commissionPercentage(25.0)
                .minimumBookingDurationMinutes(60)
                .maintenanceMode(false)
                .autoApproveScreens(false)
                .build();
        return platformSettingsRepository.save(settings);
    }
}
