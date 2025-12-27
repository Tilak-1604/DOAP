package com.DOAP.config;


import com.DOAP.entity.Role;
import com.DOAP.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles if they don't exist
        initializeRoles();
    }

    private void initializeRoles() {
        String[] roleNames = {"ADVERTISER", "SCREEN_OWNER", "AD_EDITOR", "ADMIN"};

        for (String roleName : roleNames) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
                System.out.println("Initialized role: " + roleName);
            }
        }
    }
}

