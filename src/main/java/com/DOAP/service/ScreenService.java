package com.DOAP.service;

import com.DOAP.dto.ScreenApprovalRequest;
import com.DOAP.dto.ScreenRequest;
import com.DOAP.dto.ScreenResponse;

import java.util.List;

public interface ScreenService {

    ScreenResponse addScreen(ScreenRequest request, Long userId, String role);

    ScreenResponse approveScreen(
            Long screenId,
            ScreenApprovalRequest request,
            Long adminId,
            String role);

    List<ScreenResponse> getAllScreens(Long userId, String role);

    ScreenResponse getScreenById(Long screenId, Long userId, String role);
}
