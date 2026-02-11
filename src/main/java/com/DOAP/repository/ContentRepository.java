package com.DOAP.repository;

import com.DOAP.entity.Content;
import com.DOAP.entity.enums.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    List<Content> findByUploaderId(Long uploaderId);

    // Admin Queries
    // Count total uploaded ads
    @Query("SELECT COUNT(c) FROM Content c")
    long countTotalAds();
}
