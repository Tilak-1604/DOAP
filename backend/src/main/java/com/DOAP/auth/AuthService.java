package com.DOAP.auth;

import com.DOAP.dto.LoginRequest;
import com.DOAP.dto.LoginResponse;
import com.DOAP.dto.RegisterRequest;
import com.DOAP.entity.AuthProvider;
import com.DOAP.entity.Role;
import com.DOAP.entity.User;
import com.DOAP.entity.UserRole;
import com.DOAP.repository.RoleRepository;
import com.DOAP.repository.UserRepository;
import com.DOAP.repository.UserRoleRepository;
import com.DOAP.service.GoogleTokenVerifier;
import com.DOAP.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final com.DOAP.service.EmailService emailService;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    public AuthService(UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            GoogleTokenVerifier googleTokenVerifier,
            com.DOAP.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.emailService = emailService;
    }

    @Transactional
    public void register(RegisterRequest request) {

        // 1️⃣ Email uniqueness
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // 2️⃣ Create user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAuthProvider(AuthProvider.LOCAL); // LOCAL is the default auth provider means email/password
        user.setActive(true);

        userRepository.save(user);

        // 3️⃣ Fetch role
        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Invalid role"));

        // 4️⃣ Assign role
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);

        userRoleRepository.save(userRole);

        // 5️⃣ Send Welcome Email
        try {
            emailService.sendRegistrationEmail(user.getEmail(), user.getName(), role.getRoleName());
        } catch (Exception e) {
            log.error("Failed to send registration email to {}", user.getEmail(), e);
        }
    }

    /**
     * Login user and generate JWT token
     * Validates credentials and returns JWT token with user roles
     */
    public LoginResponse login(LoginRequest request) {
        // 1️⃣ Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // 2️⃣ Check if user is active
        if (!user.isActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // 3️⃣ Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 4️⃣ Fetch user roles
        List<UserRole> userRoles = userRoleRepository.findByUser(user);
        List<String> roles = userRoles.stream()
                .map(userRole -> userRole.getRole().getRoleName())
                .collect(Collectors.toList());

        // 5️⃣ Generate JWT token
        String token = jwtService.generateToken(user, roles);

        // 6️⃣ Return response with token
        log.info("Generating token for user {} with roles {}", user.getEmail(), roles);
        Long expiresInSeconds = jwtExpiration / 1000; // Convert milliseconds to seconds
        return new LoginResponse(token, expiresInSeconds);
    }

    /**
     * Google OAuth Login
     * Verifies Google ID Token, creates user if doesn't exist, and generates DOAP
     * JWT
     * 
     * @param idToken Google ID Token from frontend
     * @return LoginResponse with DOAP JWT token
     */
    @Transactional
    public LoginResponse googleLogin(String idToken) {
        // 1️⃣ Verify Google ID Token (server-side verification)
        GoogleTokenVerifier.GoogleUserInfo googleUser = googleTokenVerifier.verifyToken(idToken);

        // 2️⃣ Check if user exists
        User user = userRepository.findByEmail(googleUser.getEmail())
                .orElse(null);

        if (user == null) {
            // 3️⃣ User doesn't exist - create new user
            user = new User();
            user.setEmail(googleUser.getEmail());
            user.setName(googleUser.getName());
            user.setPasswordHash(null); // Google users don't have password
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setActive(true);

            userRepository.save(user);

            // 4️⃣ Assign default role: ADVERTISER
            Role defaultRole = roleRepository.findByRoleName("ADVERTISER")
                    .orElseThrow(() -> new RuntimeException("Default role ADVERTISER not found"));

            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(defaultRole);
            userRoleRepository.save(userRole);
        } else {
            // 5️⃣ User exists - ensure authProvider is GOOGLE
            if (user.getAuthProvider() != AuthProvider.GOOGLE) {
                // Update existing LOCAL user to GOOGLE (if they switch auth method)
                user.setAuthProvider(AuthProvider.GOOGLE);
                userRepository.save(user);
            }

            // Check if user is active
            if (!user.isActive()) {
                throw new RuntimeException("User account is inactive");
            }
        }

        // 6️⃣ Fetch user roles
        List<UserRole> userRoles = userRoleRepository.findByUser(user);
        List<String> roles = userRoles.stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        // 7️⃣ Generate DOAP JWT token (NOT Google token)
        String token = jwtService.generateToken(user, roles);

        // 8️⃣ Return response with DOAP JWT
        Long expiresInSeconds = jwtExpiration / 1000;
        return new LoginResponse(token, expiresInSeconds);
    }
}
