package com.retriever.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportStatsResponse {
    private long totalDiscovered;
    private long pendingReview;
    private long approved;
    private long rejected;
    private long imported;
    private long duplicates;
    private Map<String, Long> byLocation;
}