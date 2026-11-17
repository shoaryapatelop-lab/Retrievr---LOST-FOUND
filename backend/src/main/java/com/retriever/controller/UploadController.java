package com.retriever.controller;

import com.retriever.entity.Item;
import com.retriever.entity.ItemImage;
import com.retriever.repository.ItemImageRepository;
import com.retriever.repository.ItemRepository;
import com.retriever.service.FileStorageService;
import com.retriever.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for file uploads.
 * Demonstrates layered architecture: Controller -> Service -> Repository.
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;
    private final ItemRepository itemRepository;
    private final ItemImageRepository itemImageRepository;
    private final CurrentUserService currentUserService;

    @PostMapping("/item/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadItemImage(
            @PathVariable Long itemId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            // Verify item exists and user owns it
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));

            Long userId = getUserId(authentication);
            if (!item.getReporter().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only upload images to your own items"));
            }

            // Store file
            String fileUrl = fileStorageService.storeFile(file);

            // Save image metadata
            ItemImage itemImage = new ItemImage();
            itemImage.setItem(item);
            itemImage.setImageUrl(fileUrl);
            itemImage.setFileName(file.getOriginalFilename());
            itemImage.setFileSize(file.getSize());
            itemImage.setContentType(file.getContentType());
            itemImage.setIsPrimary(false);
            itemImage = itemImageRepository.save(itemImage);

            Map<String, Object> response = new HashMap<>();
            response.put("id", itemImage.getId());
            response.put("imageUrl", itemImage.getImageUrl());
            response.put("fileName", itemImage.getFileName());
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    private Long getUserId(Authentication authentication) {
        return currentUserService.id(authentication);
    }
}