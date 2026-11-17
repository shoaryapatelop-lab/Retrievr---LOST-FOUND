package com.retriever.service;

import com.retriever.dto.ClaimRequest;
import com.retriever.dto.ClaimResponse;

import java.util.List;

public interface ClaimService {
    ClaimResponse submitClaim(ClaimRequest request, Long claimerId);
    List<ClaimResponse> getClaimsByClaimer(Long claimerId);
    List<ClaimResponse> getClaimsByReporter(Long reporterId);
    List<ClaimResponse> getClaimsByItem(Long itemId);
    List<ClaimResponse> getPendingClaims();
    ClaimResponse approveClaim(Long claimId);
    ClaimResponse rejectClaim(Long claimId);
    ClaimResponse acceptClaimByFinder(Long claimId, Long finderId);
    ClaimResponse rejectClaimByFinder(Long claimId, Long finderId, String reason);
}