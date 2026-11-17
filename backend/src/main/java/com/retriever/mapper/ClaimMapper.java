package com.retriever.mapper;

import com.retriever.dto.ClaimResponse;
import com.retriever.dto.MatchResponse;
import com.retriever.dto.NotificationResponse;
import com.retriever.entity.Claim;
import com.retriever.entity.Item;
import com.retriever.entity.ItemMatch;
import com.retriever.entity.Notification;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClaimMapper {
    public ClaimResponse toResponse(Claim claim) {
        if (claim == null) return null;
        return ClaimResponse.builder()
                .id(claim.getId())
                .itemId(claim.getItem() != null ? claim.getItem().getId() : null)
                .itemTitle(claim.getItem() != null ? claim.getItem().getTitle() : null)
                .claimerId(claim.getClaimer() != null ? claim.getClaimer().getId() : null)
                .claimerName(claim.getClaimer() != null ? (safe(claim.getClaimer().getFirstName()) + " " + safe(claim.getClaimer().getLastName())).trim() : null)
                .message(claim.getMessage())
                .proofUrl(claim.getProofUrl())
                .status(claim.getStatus())
                .claimedAt(claim.getClaimedAt())
                .createdAt(claim.getCreatedAt())
                .build();
    }

    public List<ClaimResponse> toResponseList(List<Claim> claims) {
        return claims == null ? List.of() : claims.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private String safe(String s) { return s == null ? "" : s; }
}