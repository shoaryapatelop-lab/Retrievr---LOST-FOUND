package com.retriever.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Claim entity representing a user's claim request on a found item.
 * Demonstrates <b>Encapsulation</b> and associations to Item and User.
 * Status transitions: PENDING -> APPROVED/REJECTED.
 */
@Entity
@Table(name = "claims")
@Getter
@Setter
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Claim extends BaseEntity {

    @NotNull(message = "Item is required")
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @NotNull(message = "Claimer is required")
    @ManyToOne
    @JoinColumn(name = "claimer_id", nullable = false)
    private User claimer;

    @NotBlank(message = "Claim message is required")
    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "proof_url", length = 500)
    private String proofUrl; // URL to proof image/document

    @NotNull(message = "Claim status is required")
    @Column(name = "status", nullable = false, length = 20)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(name = "claimed_at", nullable = false)
    private LocalDateTime claimedAt;

    @Column(name = "finder_confirmed_at")
    private LocalDateTime finderConfirmedAt;

    @Column(name = "claimant_confirmed_at")
    private LocalDateTime claimantConfirmedAt;

    @Column(name = "handover_confirmed_at")
    private LocalDateTime handoverConfirmedAt;
}
