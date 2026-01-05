package com.DOAP.dto;

import com.DOAP.entity.enums.ScreenStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenStatusRequest {

    @NotNull(message = "Status is required")
    private ScreenStatus status;
}
