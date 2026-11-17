package com.retriever.repository;

import com.retriever.entity.Claim;
import com.retriever.entity.ClaimStatus;
import com.retriever.entity.Item;
import com.retriever.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Claim entity.
 * Demonstrates <b>Abstraction</b> via Spring Data JPA repository interface.
 */
@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByClaimerId(Long claimerId);

    List<Claim> findByItemReporterId(Long reporterId);

    List<Claim> findByItemId(Long itemId);

    List<Claim> findByStatusOrderByCreatedAtAsc(ClaimStatus status);

    List<Claim> findByClaimerAndStatusOrderByCreatedAtDesc(User claimer, ClaimStatus status);
}