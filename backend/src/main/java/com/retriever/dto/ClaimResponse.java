package com.retriever.dto;

import com.retriever.entity.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning claim data.
 * Demonstrates <b>Encapsulation</b> in DTO layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {
    private Long id;
    private Long itemId;
    private String itemTitle;
    private Long claimerId;
    private String claimerName;
    private String message;
    private String proofUrl;
    private ClaimStatus status;
    private LocalDateTime claimedAt;
    private LocalDateTime createdAt;
}