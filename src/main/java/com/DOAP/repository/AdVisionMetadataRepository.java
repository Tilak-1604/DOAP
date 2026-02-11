package com.DOAP.repository;

import com.DOAP.entity.AdVisionMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdVisionMetadataRepository extends JpaRepository<AdVisionMetadata, Long> {
    Optional<AdVisionMetadata> findByContent_Id(Long contentId);

    java.util.List<AdVisionMetadata> findByContent_UploaderId(Long uploaderId);
}
