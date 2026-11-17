package com.retriever.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for reporting a lost or found item.
 * Demonstrates <b>Encapsulation</b> in DTO layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String locationFound;

    @NotNull(message = "Date is required")
    private LocalDateTime dateFound;

    private String color;

    private String brand;

    private String contactInfo;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String lastSeenLocation; // For lost items
}