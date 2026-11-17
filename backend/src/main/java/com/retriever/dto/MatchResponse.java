package com.retriever.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for returning match data.
 * Demonstrates <b>Encapsulation</b> in DTO layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private Long lostItemId;
    private String lostItemTitle;
    private Long foundItemId;
    private String foundItemTitle;
    private Double matchScore;
    private Double nameScore;
    private Double categoryScore;
    private Double colorScore;
    private Double brandScore;
    private Double locationScore;
    private Double dateScore;
    private Double descriptionScore;
}