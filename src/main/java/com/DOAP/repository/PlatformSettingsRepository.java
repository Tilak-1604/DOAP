package com.DOAP.repository;

import com.DOAP.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Long> {
    // Platform settings will have only one row with ID=1
}
