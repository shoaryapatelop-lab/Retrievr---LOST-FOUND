package com.retriever.controller;

import com.retriever.dto.ClaimRequest;
import com.retriever.dto.ClaimResponse;
import com.retriever.service.ClaimService;
import com.retriever.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClaimResponse> submitClaim(
            @Valid @RequestBody ClaimRequest request,
            Authentication authentication) {
        Long claimerId = getUserId(authentication);
        ClaimResponse response = claimService.submitClaim(request, claimerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(claimService.getClaimsByClaimer(userId));
    }

    @GetMapping("/received")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClaimResponse>> getReceivedClaims(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(claimService.getClaimsByReporter(userId));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ClaimResponse>> getClaimsByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(claimService.getClaimsByItem(itemId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getPendingClaims() {
        return ResponseEntity.ok(claimService.getPendingClaims());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimResponse> approveClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.approveClaim(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimResponse> rejectClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.rejectClaim(id));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClaimResponse> acceptClaimByFinder(@PathVariable Long id, Authentication authentication) {
        Long finderId = getUserId(authentication);
        return ResponseEntity.ok(claimService.acceptClaimByFinder(id, finderId));
    }

    @PutMapping("/{id}/decline")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClaimResponse> rejectClaimByFinder(@PathVariable Long id, @RequestParam(required = false) String reason, Authentication authentication) {
        Long finderId = getUserId(authentication);
        return ResponseEntity.ok(claimService.rejectClaimByFinder(id, finderId, reason));
    }

    private Long getUserId(Authentication authentication) {
        return currentUserService.id(authentication);
    }
}
