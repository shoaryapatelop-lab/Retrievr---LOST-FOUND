package com.retriever.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveImportRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String locationFound;

    @NotNull(message = "Date found is required")
    private java.time.LocalDateTime dateFound;

    private String color;

    private String brand;

    private String contactInfo;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String reviewNotes;
}