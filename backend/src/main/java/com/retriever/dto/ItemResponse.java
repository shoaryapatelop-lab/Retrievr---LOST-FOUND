package com.retriever.dto;

import com.retriever.entity.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {
    private Long id;
    private String title;
    private String description;
    private String locationFound;
    private LocalDateTime dateFound;
    private ItemStatus status;
    private String color;
    private String brand;
    private String contactInfo;
    private Long reporterId;
    private String reporterName;
    private Long categoryId;
    private String categoryName;
    private String itemType;
    private String lastSeenLocation;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}