package com.DOAP.service;

import com.DOAP.dto.AdBusinessDetailsRequest;
import com.DOAP.entity.AdBusinessDetails;
import com.DOAP.entity.Content;
import com.DOAP.repository.AdBusinessDetailsRepository;
import com.DOAP.repository.ContentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdBusinessDetailsService {

    private final AdBusinessDetailsRepository adBusinessDetailsRepository;
    private final ContentRepository contentRepository;

    @Transactional
    public AdBusinessDetails saveAdDetails(AdBusinessDetailsRequest request) {
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new EntityNotFoundException("Content not found with ID: " + request.getContentId()));

        // Check if details already exist for this content
        AdBusinessDetails existingDetails = adBusinessDetailsRepository.findByContentId(request.getContentId())
                .orElse(null);

        if (existingDetails != null) {
            // Update existing
            existingDetails.setBusinessType(request.getBusinessType());
            existingDetails.setCampaignDescription(request.getCampaignDescription());
            existingDetails.setBudgetRange(request.getBudgetRange());
            existingDetails.setPreferredTimeSlot(request.getPreferredTimeSlot());
            return adBusinessDetailsRepository.save(existingDetails);
        } else {
            // Create new
            AdBusinessDetails details = AdBusinessDetails.builder()
                    .content(content)
                    .businessType(request.getBusinessType())
                    .campaignDescription(request.getCampaignDescription())
                    .budgetRange(request.getBudgetRange())
                    .preferredTimeSlot(request.getPreferredTimeSlot())
                    .build();
            return adBusinessDetailsRepository.save(details);
        }
    }

    public AdBusinessDetails getDetailsByContentId(Long contentId) {
        return adBusinessDetailsRepository.findByContentId(contentId)
                .orElseThrow(() -> new EntityNotFoundException("Ad details not found for content ID: " + contentId));
    }
}
