package com.DOAP.repository;

import com.DOAP.entity.User;
import com.DOAP.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUser(User user);

    long countByRole_RoleName(String roleName);
}