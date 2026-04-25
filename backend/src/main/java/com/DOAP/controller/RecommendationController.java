package com.DOAP.controller;

import com.DOAP.dto.ScreenRecommendationDTO;
import com.DOAP.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/content/{contentId}")
    public ResponseEntity<List<ScreenRecommendationDTO>> getRecommendations(@PathVariable Long contentId) {
        log.info("Recommendation endpoint called for content ID: {}", contentId);
        try {
            List<ScreenRecommendationDTO> recommendations = recommendationService.getRecommendations(contentId);
            log.info("Returning {} recommendations", recommendations.size());
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            log.error("Error getting recommendations: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
