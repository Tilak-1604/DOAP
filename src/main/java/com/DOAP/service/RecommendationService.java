package com.DOAP.service;

import com.DOAP.dto.MLRecommendationRequest;
import com.DOAP.dto.MLRecommendationResponse;
import com.DOAP.dto.MLRecommendationWrapper;
import com.DOAP.dto.ScreenRecommendationDTO;
import com.DOAP.entity.AdBusinessDetails;
import com.DOAP.entity.AdVisionMetadata;
import com.DOAP.entity.Content;
import com.DOAP.entity.Screen;
import com.DOAP.repository.AdBusinessDetailsRepository;
import com.DOAP.repository.AdVisionMetadataRepository;
import com.DOAP.repository.ContentRepository;
import com.DOAP.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final ContentRepository contentRepository;
    private final AdBusinessDetailsRepository adBusinessDetailsRepository;
    private final AdVisionMetadataRepository adVisionMetadataRepository;
    private final ScreenRepository screenRepository;
    private final RestTemplate restTemplate;

    @Value("${ml.service.url:http://localhost:5000}")
    private String mlServiceUrl;

    /**
     * Get screen recommendations for a given content ID
     */
    public List<ScreenRecommendationDTO> getRecommendations(Long contentId) {
        log.info("========== RECOMMENDATION REQUEST START ==========");
        log.info("Content ID: {}", contentId);

        // 1. Fetch content and related data
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        log.info("Content found: {}", content.getId());

        AdBusinessDetails businessDetails = adBusinessDetailsRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("Ad business details not found"));
        log.info("Business details found: {}", businessDetails.getBusinessType());

        AdVisionMetadata visionMetadata = adVisionMetadataRepository.findByContentId(contentId)
                .orElse(null);
        log.info("Vision metadata found: {}", visionMetadata != null);

        // 2. Construct advertiser text
        String advertiserText = constructAdvertiserText(businessDetails, visionMetadata);
        log.info("Advertiser text: {}", advertiserText);

        // 3. Fetch all active screens
        List<Screen> activeScreens = screenRepository.findByStatus(com.DOAP.entity.enums.ScreenStatus.ACTIVE);
        log.info("Active screens found: {}", activeScreens.size());
        if (activeScreens.isEmpty()) {
            log.warn("No active screens found!");
            return new ArrayList<>();
        }

        // 4. Construct screen texts
        List<MLRecommendationRequest.MLScreenData> screenDataList = activeScreens.stream()
                .map(screen -> new MLRecommendationRequest.MLScreenData(
                        screen.getId(),
                        constructScreenText(screen)))
                .collect(Collectors.toList());

        log.info("Screen data list size: {}", screenDataList.size());

        // Validating Screen Texts before sending
        for (MLRecommendationRequest.MLScreenData data : screenDataList) {
            if (data.getText() == null || data.getText().trim().isEmpty()) {
                log.error("CRITICAL: Empty text for Screen ID: {}", data.getId());
            } else {
                log.debug("Screen ID: {} | Text: {}", data.getId(), data.getText());
            }
        }

        if (!screenDataList.isEmpty()) {
            log.info("Sample screen text (First): {}", screenDataList.get(0).getText());
        }

        // 5. Call ML service
        MLRecommendationRequest request = new MLRecommendationRequest(advertiserText, screenDataList);
        log.info("Calling ML service at: {}/recommend", mlServiceUrl);

        try {
            MLRecommendationWrapper wrapper = restTemplate.postForObject(
                    mlServiceUrl + "/recommend",
                    request,
                    MLRecommendationWrapper.class);

            log.info("ML service response received");

            if (wrapper == null || wrapper.getResults() == null || wrapper.getResults().isEmpty()) {
                log.warn("No recommendations returned from ML service");
                if (wrapper != null && wrapper.getError() != null) {
                    log.error("ML service error: {}", wrapper.getError());
                }
                return new ArrayList<>();
            }

            MLRecommendationResponse[] responses = wrapper.getResults().toArray(new MLRecommendationResponse[0]);
            log.info("ML service response count: {}", responses.length);

            // 6. Map to DTOs with screen details
            List<ScreenRecommendationDTO> result = java.util.Arrays.stream(responses)
                    .filter(response -> response.getScore() >= 0.15) // Filter by threshold
                    .map(response -> {
                        Screen screen = activeScreens.stream()
                                .filter(s -> s.getId().equals(response.getScreenId()))
                                .findFirst()
                                .orElse(null);

                        if (screen == null)
                            return null;

                        return new ScreenRecommendationDTO(
                                screen.getId(),
                                screen.getScreenName(),
                                screen.getLocation(),
                                response.getScore(),
                                screen.getCity(),
                                screen.getPricePerHour());
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());

            log.info("Final recommendations count (score >= 0.15): {}", result.size());
            log.info("========== RECOMMENDATION REQUEST END ==========");
            return result;

        } catch (Exception e) {
            log.error("Error calling ML service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get recommendations: " + e.getMessage());
        }
    }

    /**
     * Construct advertiser text from business details and vision metadata
     */
    private String constructAdvertiserText(AdBusinessDetails businessDetails, AdVisionMetadata visionMetadata) {
        StringBuilder text = new StringBuilder();

        // 1. Business type (primary)
        if (businessDetails.getBusinessType() != null && !businessDetails.getBusinessType().isEmpty()) {
            text.append(businessDetails.getBusinessType()).append(" advertisement. ");
        }

        // 2. Campaign description (primary)
        if (businessDetails.getCampaignDescription() != null && !businessDetails.getCampaignDescription().isEmpty()) {
            text.append(businessDetails.getCampaignDescription()).append(". ");
        }

        // 3. Preferred time slot (optional)
        if (businessDetails.getPreferredTimeSlot() != null && !businessDetails.getPreferredTimeSlot().isEmpty()) {
            text.append("Preferred time ").append(businessDetails.getPreferredTimeSlot()).append(". ");
        }

        // 4. Vision metadata (secondary)
        if (visionMetadata != null) {
            if (visionMetadata.getDetectedLabels() != null && !visionMetadata.getDetectedLabels().isEmpty()) {
                text.append("Related terms: ").append(visionMetadata.getDetectedLabels()).append(". ");
            }
            if (visionMetadata.getDetectedText() != null && !visionMetadata.getDetectedText().isEmpty()) {
                text.append("Text: ").append(visionMetadata.getDetectedText()).append(". ");
            }
        }

        return text.toString().trim();
    }

    /**
     * Construct screen text from screen details
     */
    /**
     * Construct screen text from screen details
     */
    private String constructScreenText(Screen screen) {
        StringBuilder text = new StringBuilder();

        // 0. Basic Info (Guarantees non-empty text)
        // if (screen.getScreenName() != null) {
        // text.append(screen.getScreenName()).append(". ");
        // }

        // 0. Basic Info
        // if (screen.getScreenName() != null) {
        // text.append(screen.getScreenName()).append(". ");
        // }

        // 1. Footfall category (Promoted to primary descriptor)
        // if (screen.getFootfallCategory() != null) {
        // text.append(screen.getFootfallCategory().toString().replace("_", " "))
        // .append(" footfall area. ");
        // }

        // 2. Visibility level
        // if (screen.getVisibilityLevel() != null) {
        // text.append(screen.getVisibilityLevel().toString())
        // .append(" visibility. ");
        // }

        // 4. Location details (City + Zone + Raw Location)
        // if (screen.getCity() != null && !screen.getCity().isEmpty()) {
        // text.append("Located in ").append(screen.getCity());
        // if (screen.getZone() != null && !screen.getZone().isEmpty()) {
        // text.append(" ").append(screen.getZone());
        // }
        // text.append(". ");
        // }

        // Append raw location as fallback/enrichment
        // if (screen.getLocation() != null && !screen.getLocation().isEmpty()) {
        // text.append(screen.getLocation()).append(". ");
        // }

        // Append description if available
        if (screen.getDescription() != null && !screen.getDescription().isEmpty()) {
            text.append(screen.getDescription()).append(". ");
        }

        String finalText = text.toString().trim();

        // Final fallback to ensure NO empty strings
        if (finalText.isEmpty()) {
            return "Screen Display at " + screen.getId();
        }

        return finalText;
    }
}
