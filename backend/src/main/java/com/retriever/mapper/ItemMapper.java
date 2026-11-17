package com.retriever.mapper;

import com.retriever.dto.ItemResponse;
import com.retriever.entity.FoundItem;
import com.retriever.entity.Item;
import com.retriever.entity.LostItem;
import com.retriever.repository.ItemImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ItemMapper {
    private final ItemImageRepository itemImageRepository;

    public ItemResponse toResponse(Item item) {
        if (item == null) return null;
        
        // Primary: Get images from ItemImage table (new system)
        List<String> imageUrls = itemImageRepository.findByItemId(item.getId()).stream()
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList());
        
        // Fallback: For FoundItems, also check the legacy imageUrls field
        if (imageUrls.isEmpty() && item instanceof FoundItem foundItem) {
            String legacyUrls = foundItem.getImageUrls();
            if (legacyUrls != null && !legacyUrls.isBlank()) {
                // Support comma-separated or single URLs
                for (String url : legacyUrls.split(",")) {
                    String trimmed = url.trim();
                    if (!trimmed.isEmpty()) {
                        imageUrls.add(trimmed);
                    }
                }
            }
        }
        
        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .locationFound(item.getLocationFound())
                .dateFound(item.getDateFound())
                .status(item.getStatus())
                .color(item.getColor())
                .brand(item.getBrand())
                .contactInfo(item.getContactInfo())
                .reporterId(item.getReporter() != null ? item.getReporter().getId() : null)
                .reporterName(item.getReporter() != null ? (safe(item.getReporter().getFirstName()) + " " + safe(item.getReporter().getLastName())).trim() : null)
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .itemType(item instanceof LostItem ? "LOST" : (item instanceof FoundItem ? "FOUND" : "ITEM"))
                .lastSeenLocation(item instanceof LostItem ? ((LostItem) item).getLastSeenLocation() : null)
                .imageUrls(imageUrls)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private String safe(String s) { return s == null ? "" : s; }
}