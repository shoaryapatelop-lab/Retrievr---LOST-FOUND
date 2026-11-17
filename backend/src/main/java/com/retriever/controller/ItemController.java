package com.retriever.controller;

import com.retriever.dto.ItemRequest;
import com.retriever.dto.ItemResponse;
import com.retriever.dto.MatchResponse;
import com.retriever.service.CurrentUserService;
import com.retriever.service.ItemService;
import com.retriever.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final MatchService matchService;
    private final CurrentUserService currentUserService;

    @PostMapping("/lost")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ItemResponse> reportLostItem(@Valid @RequestBody ItemRequest request, Authentication authentication) {
        ItemResponse response = itemService.reportLostItem(request, currentUserService.id(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/found")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ItemResponse> reportFoundItem(@Valid @RequestBody ItemRequest request, Authentication authentication) {
        ItemResponse response = itemService.reportFoundItem(request, currentUserService.id(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ItemResponse>> searchItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, name = "sortBy") String sortBy,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(itemService.searchItems(keyword, category, location, color, brand, status, sortBy, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ItemResponse> updateItem(@PathVariable Long id, @RequestBody ItemRequest request, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return ResponseEntity.ok(itemService.updateItem(id, request, currentUserService.id(authentication), isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        itemService.deleteItem(id, currentUserService.id(authentication), isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ItemResponse>> getRecentlyReportedItems(@RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(itemService.getRecentlyReportedItems(limit));
    }

    @GetMapping("/recent/found")
    public ResponseEntity<List<ItemResponse>> getRecentlyFoundItems(@RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(itemService.getRecentlyFoundItems(limit));
    }

    @GetMapping("/recent/lost")
    public ResponseEntity<List<ItemResponse>> getRecentlyLostItems(@RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(itemService.getRecentlyLostItems(limit));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ItemResponse>> getMyItems(Authentication authentication) {
        return ResponseEntity.ok(itemService.getItemsByReporter(currentUserService.id(authentication)));
    }

    @GetMapping("/my/lost")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ItemResponse>> getMyLostItems(Authentication authentication) {
        return ResponseEntity.ok(itemService.getLostItemsByReporter(currentUserService.id(authentication)));
    }

    @GetMapping("/my/found")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ItemResponse>> getMyFoundItems(Authentication authentication) {
        return ResponseEntity.ok(itemService.getFoundItemsByReporter(currentUserService.id(authentication)));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<MatchResponse>> getMatches(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.refreshMatches(id));
    }

    @PostMapping("/{id}/matches")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MatchResponse>> refreshMatches(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.refreshMatches(id));
    }
}