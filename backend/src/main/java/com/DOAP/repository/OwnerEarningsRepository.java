package com.DOAP.repository;

import com.DOAP.entity.OwnerEarnings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerEarningsRepository extends JpaRepository<OwnerEarnings, Long> {
    List<OwnerEarnings> findByScreenOwnerId(Long screenOwnerId);
}
