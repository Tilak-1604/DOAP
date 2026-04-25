package com.DOAP.controller;

import com.DOAP.entity.Content;
import com.DOAP.entity.User;
import com.DOAP.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final com.DOAP.repository.UserRepository userRepository;
    private final com.DOAP.repository.ContentRepository contentRepository;
    private final com.DOAP.repository.AdVisionMetadataRepository adVisionMetadataRepository;

    private User getUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        } else if (principal instanceof String) {
            String email = (String) principal;
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        } else {
            throw new RuntimeException("Unknown principal type: " + principal.getClass().getName());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadContent(@RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            User user = getUser(authentication);
            Content content = contentService.uploadAndValidateContent(file, user.getId());
            return ResponseEntity.ok(content);
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(501).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/my-content")
    public ResponseEntity<?> getMyContent(Authentication authentication) {
        try {
            User user = getUser(authentication);
            return ResponseEntity.ok(contentRepository.findByUploaderId(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to fetch content: " + e.getMessage());
        }
    }

    @GetMapping("/my-metadata")
    public ResponseEntity<?> getMyContentMetadata(Authentication authentication) {
        try {
            User user = getUser(authentication);
            // Assuming we need a way to find metadata for all user content.
            // Since we don't have a direct repository method for this yet, we can fetch
            // content first then metadata.
            // But better to use JPQL in repo.
            // Let's us a simple loop or modify repo.
            // Actually, I can add a method to AdVisionMetadataRepository:
            // findByContentUploaderId(Long uploaderId)
            // But AdVisionMetadata has 'content'. 'content' has 'uploaderId'.
            // So: findByContent_UploaderId(Long uploaderId) should work with Spring Data
            // JPA property expression.
            return ResponseEntity.ok(adVisionMetadataRepository.findByContent_UploaderId(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to fetch metadata: " + e.getMessage());
        }
    }
}
