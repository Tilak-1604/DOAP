package com.DOAP.repository;

import com.DOAP.entity.AdBusinessDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdBusinessDetailsRepository extends JpaRepository<AdBusinessDetails, Long> {
    Optional<AdBusinessDetails> findByContent_Id(Long contentId);
}
