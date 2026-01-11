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
}
