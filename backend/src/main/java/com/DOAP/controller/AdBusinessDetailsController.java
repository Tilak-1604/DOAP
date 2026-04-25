package com.DOAP.controller;

import com.DOAP.dto.AdBusinessDetailsRequest;
import com.DOAP.entity.AdBusinessDetails;
import com.DOAP.service.AdBusinessDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ad-details")
@RequiredArgsConstructor
public class AdBusinessDetailsController {

    private final AdBusinessDetailsService adBusinessDetailsService;

    @PostMapping
    public ResponseEntity<AdBusinessDetails> saveAdDetails(@RequestBody AdBusinessDetailsRequest request) {
        try {
            AdBusinessDetails details = adBusinessDetailsService.saveAdDetails(request);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            e.printStackTrace(); // Log error to console
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/content/{contentId}")
    public ResponseEntity<AdBusinessDetails> getDetailsByContentId(@PathVariable Long contentId) {
        try {
            AdBusinessDetails details = adBusinessDetailsService.getDetailsByContentId(contentId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
