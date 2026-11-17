package com.retriever.service;

import com.retriever.dto.ItemRequest;
import com.retriever.dto.ItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ItemService {
    ItemResponse reportLostItem(ItemRequest request, Long reporterId);
    ItemResponse reportFoundItem(ItemRequest request, Long reporterId);
    ItemResponse getItemById(Long id);
    ItemResponse updateItem(Long itemId, ItemRequest request, Long requesterId, boolean isAdmin);
    void deleteItem(Long itemId, Long requesterId, boolean isAdmin);
    Page<ItemResponse> searchItems(String keyword, String category, String location, String color, String brand, String status, String sortBy, Pageable pageable);
    List<ItemResponse> getRecentlyReportedItems(int limit);
    List<ItemResponse> getRecentlyFoundItems(int limit);
    List<ItemResponse> getRecentlyLostItems(int limit);
    List<ItemResponse> getItemsByReporter(Long reporterId);
    List<ItemResponse> getLostItemsByReporter(Long reporterId);
    List<ItemResponse> getFoundItemsByReporter(Long reporterId);
    void triggerMatching(Long itemId);
}