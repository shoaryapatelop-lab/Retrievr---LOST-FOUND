package com.retriever.service.impl;

import com.retriever.dto.ClaimRequest;
import com.retriever.dto.ClaimResponse;
import com.retriever.mapper.ClaimMapper;
import com.retriever.entity.*;
import com.retriever.repository.ClaimRepository;
import com.retriever.repository.ItemRepository;
import com.retriever.repository.UserRepository;
import com.retriever.service.ClaimService;
import com.retriever.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ClaimMapper claimMapper;

    @Override
    @Transactional
    public ClaimResponse submitClaim(ClaimRequest request, Long claimerId) {
        if (request == null || request.getItemId() == null) {
            throw new IllegalArgumentException("Item ID is required");
        }
        User claimer = userRepository.findById(claimerId).orElseThrow(() -> new IllegalArgumentException("Claimer not found"));
        Item item = itemRepository.findById(request.getItemId()).orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (item instanceof LostItem) {
            throw new IllegalStateException("Claims can only be submitted for found items");
        }
        if (item.getStatus() == ItemStatus.RETURNED || item.getStatus() == ItemStatus.ARCHIVED) {
            throw new IllegalStateException("This item has already been returned");
        }
        if (item.getReporter() != null && item.getReporter().getId().equals(claimerId)) {
            throw new IllegalStateException("You cannot claim your own item");
        }
        boolean duplicate = claimRepository.findByClaimerId(claimerId).stream()
                .anyMatch(c -> c.getItem() != null && request.getItemId().equals(c.getItem().getId()) && c.getStatus() == ClaimStatus.PENDING);
        if (duplicate) {
            throw new IllegalStateException("You already have a pending claim for this item");
        }

        Claim claim = new Claim();
        claim.setItem(item);
        claim.setClaimer(claimer);
        claim.setMessage(request.getMessage());
        claim.setProofUrl(request.getProofUrl());
        claim.setStatus(ClaimStatus.PENDING);
        claim.setClaimedAt(LocalDateTime.now());
        claim = claimRepository.save(claim);

        if (item.getStatus() == ItemStatus.AVAILABLE) {
            item.setStatus(ItemStatus.CLAIMED);
            itemRepository.save(item);
        }

        if (item.getReporter() != null) {
            notificationService.createNotification(item.getReporter(), NotificationType.CLAIM_UPDATE,
                    "New claim submitted",
                    "A new claim was submitted for your item: " + safe(item.getTitle()),
                    "CLAIM", claim.getId());
        }
        notificationService.createNotification(claimer, NotificationType.CLAIM_UPDATE,
                "Claim submitted",
                "Your claim for \"" + safe(item.getTitle()) + "\" was submitted and is pending review.",
                "CLAIM", claim.getId());

        return claimMapper.toResponse(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsByClaimer(Long claimerId) {
        return claimRepository.findByClaimerId(claimerId).stream().map(claimMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsByReporter(Long reporterId) {
        return claimRepository.findByItemReporterId(reporterId).stream().map(claimMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsByItem(Long itemId) {
        return claimRepository.findByItemId(itemId).stream().map(claimMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getPendingClaims() {
        return claimRepository.findByStatusOrderByCreatedAtAsc(ClaimStatus.PENDING).stream().map(claimMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClaimResponse approveClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalStateException("Only pending claims can be approved");
        }
        claim.setStatus(ClaimStatus.APPROVED);
        claim = claimRepository.save(claim);

        Item item = claim.getItem();
        if (item != null) {
            item.setStatus(ItemStatus.RETURNED);
            itemRepository.save(item);
            for (Claim other : claimRepository.findByItemId(item.getId())) {
                if (!other.getId().equals(claim.getId()) && other.getStatus() == ClaimStatus.PENDING) {
                    other.setStatus(ClaimStatus.REJECTED);
                    claimRepository.save(other);
                    if (other.getClaimer() != null) {
                        notificationService.createNotification(other.getClaimer(), NotificationType.CLAIM_UPDATE,
                                "Claim rejected",
                                "Your claim for \"" + safe(item.getTitle()) + "\" was rejected.",
                                "CLAIM", other.getId());
                    }
                }
            }
            if (item.getReporter() != null) {
                notificationService.createNotification(item.getReporter(), NotificationType.ITEM_UPDATE,
                        "Item returned",
                        "A claim for \"" + safe(item.getTitle()) + "\" was approved and the item is marked as returned.",
                        "ITEM", item.getId());
            }
        }

        if (claim.getClaimer() != null) {
            notificationService.createNotification(claim.getClaimer(), NotificationType.CLAIM_UPDATE,
                    "Claim approved",
                    "Your claim for \"" + safe(item != null ? item.getTitle() : "item") + "\" was approved.",
                    "CLAIM", claim.getId());
        }
        return claimMapper.toResponse(claim);
    }

    @Override
    @Transactional
    public ClaimResponse rejectClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalStateException("Only pending claims can be rejected");
        }
        claim.setStatus(ClaimStatus.REJECTED);
        claim = claimRepository.save(claim);

        Item item = claim.getItem();
        if (item != null) {
            boolean hasOtherPending = claimRepository.findByItemId(item.getId()).stream()
                    .anyMatch(c -> c.getStatus() == ClaimStatus.PENDING);
            if (!hasOtherPending && item.getStatus() == ItemStatus.CLAIMED) {
                item.setStatus(ItemStatus.AVAILABLE);
                itemRepository.save(item);
            }
        }

        if (claim.getClaimer() != null) {
            notificationService.createNotification(claim.getClaimer(), NotificationType.CLAIM_UPDATE,
                    "Claim rejected",
                    "Your claim for \"" + safe(item != null ? item.getTitle() : "item") + "\" was rejected.",
                    "CLAIM", claim.getId());
        }
        return claimMapper.toResponse(claim);
    }

    @Override
    @Transactional
    public ClaimResponse acceptClaimByFinder(Long claimId, Long finderId) {
        Claim claim = claimRepository.findById(claimId).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        Item item = claim.getItem();
        if (item == null || item.getReporter() == null || !item.getReporter().getId().equals(finderId)) {
            throw new SecurityException("You are not allowed to manage this claim");
        }
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalStateException("Only pending claims can be accepted");
        }
        claim.setStatus(ClaimStatus.ACCEPTED_BY_FINDER);
        claim = claimRepository.save(claim);
        if (claim.getClaimer() != null) {
            notificationService.createNotification(claim.getClaimer(), NotificationType.CLAIM_UPDATE,
                    "Claim accepted",
                    "Your claim for \"" + safe(item.getTitle()) + "\" was accepted by the finder. Arrange handover.",
                    "CLAIM", claim.getId());
        }
        return claimMapper.toResponse(claim);
    }

    @Override
    @Transactional
    public ClaimResponse rejectClaimByFinder(Long claimId, Long finderId, String reason) {
        Claim claim = claimRepository.findById(claimId).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        Item item = claim.getItem();
        if (item == null || item.getReporter() == null || !item.getReporter().getId().equals(finderId)) {
            throw new SecurityException("You are not allowed to manage this claim");
        }
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalStateException("Only pending claims can be rejected");
        }
        claim.setStatus(ClaimStatus.REJECTED_BY_FINDER);
        claim = claimRepository.save(claim);
        if (item != null && item.getStatus() == ItemStatus.CLAIMED) {
            boolean hasOtherPending = claimRepository.findByItemId(item.getId()).stream()
                    .anyMatch(c -> c.getStatus() == ClaimStatus.PENDING);
            if (!hasOtherPending) {
                item.setStatus(ItemStatus.AVAILABLE);
                itemRepository.save(item);
            }
        }
        if (claim.getClaimer() != null) {
            notificationService.createNotification(claim.getClaimer(), NotificationType.CLAIM_UPDATE,
                    "Claim rejected",
                    "Your claim for \"" + safe(item != null ? item.getTitle() : "item") + "\" was rejected by the finder." + (reason == null ? "" : " Reason: " + reason),
                    "CLAIM", claim.getId());
        }
        return claimMapper.toResponse(claim);
    }

    private String safe(String s) { return s == null ? "" : s; }
}
