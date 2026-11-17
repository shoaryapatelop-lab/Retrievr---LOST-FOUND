package com.retriever.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin dashboard statistics.
 * Demonstrates <b>Encapsulation</b> in DTO layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long totalUsers;
    private Long totalLostItems;
    private Long totalFoundItems;
    private Long totalClaims;
    private Long pendingClaims;
    private Long resolvedCases;
    private Long returnedItems;
    private Long availableItems;
}