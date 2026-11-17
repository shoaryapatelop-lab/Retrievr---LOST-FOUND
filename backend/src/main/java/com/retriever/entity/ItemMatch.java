package com.retriever.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * ItemMatch entity storing computed similarity scores between a LostItem and a FoundItem.
 * Demonstrates <b>Encapsulation</b> and association to two Item instances.
 */
@Entity
@Table(name = "item_matches")
@Getter
@Setter
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class ItemMatch extends BaseEntity {

    @NotNull(message = "Lost item is required")
    @ManyToOne
    @JoinColumn(name = "lost_item_id", nullable = false)
    private Item lostItem;

    @NotNull(message = "Found item is required")
    @ManyToOne
    @JoinColumn(name = "found_item_id", nullable = false)
    private Item foundItem;

    @Min(value = 0, message = "Match score must be at least 0")
    @Max(value = 100, message = "Match score must be at most 100")
    @Column(name = "match_score", nullable = false)
    private Double matchScore;

    @Column(name = "name_score")
    private Double nameScore;

    @Column(name = "category_score")
    private Double categoryScore;

    @Column(name = "color_score")
    private Double colorScore;

    @Column(name = "brand_score")
    private Double brandScore;

    @Column(name = "location_score")
    private Double locationScore;

    @Column(name = "date_score")
    private Double dateScore;

    @Column(name = "description_score")
    private Double descriptionScore;

    @Column(name = "is_notified", nullable = false)
    private Boolean isNotified = false;
}