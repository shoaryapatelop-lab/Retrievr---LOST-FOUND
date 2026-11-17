package com.retriever.service;

import com.retriever.entity.FoundItem;
import com.retriever.entity.Item;
import com.retriever.entity.ItemImage;
import com.retriever.repository.FoundItemRepository;
import com.retriever.repository.ItemImageRepository;
import com.retriever.repository.ItemRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataMigrationService {

    private final FoundItemRepository foundItemRepository;
    private final ItemImageRepository itemImageRepository;
    private final ItemRepository itemRepository;

    @Value("${app.upload.dir:../uploads}")
    private String uploadDir;

    @PostConstruct
    @Transactional
    public void migrateLegacyImages() {
        log.info("Starting legacy image migration...");
        
        List<FoundItem> foundItems = foundItemRepository.findAll();
        int migratedCount = 0;
        
        for (FoundItem foundItem : foundItems) {
            String legacyUrls = foundItem.getImageUrls();
            if (legacyUrls == null || legacyUrls.isBlank()) {
                continue;
            }
            
            // Check if this item already has ItemImage records
            List<ItemImage> existingImages = itemImageRepository.findByItemId(foundItem.getId());
            if (!existingImages.isEmpty()) {
                log.debug("Item {} already has {} images, skipping", foundItem.getId(), existingImages.size());
                continue;
            }
            
            // Parse comma-separated URLs
            String[] urls = legacyUrls.split(",");
            for (int i = 0; i < urls.length; i++) {
                String url = urls[i].trim();
                if (url.isEmpty()) continue;
                
                try {
                    String fileHash = computeFileHash(url);
                    
                    ItemImage itemImage = new ItemImage();
                    itemImage.setItem(foundItem);
                    itemImage.setImageUrl(url);
                    itemImage.setFileName(extractFileName(url));
                    itemImage.setFileSize(getFileSize(url));
                    itemImage.setContentType(getContentType(url));
                    itemImage.setFileHash(fileHash);
                    itemImage.setIsPrimary(i == 0);
                    
                    itemImageRepository.save(itemImage);
                    log.info("Created ItemImage for item {}: {}", foundItem.getId(), url);
                    migratedCount++;
                } catch (Exception e) {
                    log.warn("Failed to migrate image {} for item {}: {}", url, foundItem.getId(), e.getMessage());
                }
            }
        }
        
        log.info("Legacy image migration completed. Migrated {} images.", migratedCount);
        
        // Also try to match orphaned upload files to items
        matchOrphanedUploads();
    }

    @Transactional
    public void matchOrphanedUploads() {
        log.info("Scanning uploads directory for orphaned files...");
        
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                log.warn("Upload directory does not exist: {}", uploadPath);
                return;
            }
            
            Files.list(uploadPath).forEach(filePath -> {
                String fileName = filePath.getFileName().toString();
                String fileUrl = "/uploads/" + fileName;
                
                // Check if this file is already referenced in any ItemImage
                Optional<ItemImage> existing = itemImageRepository.findByImageUrl(fileUrl);
                if (existing.isPresent()) {
                    return;
                }
                
                // Try to find an item that might reference this file
                // For now, just log it - manual review needed
                log.info("Orphaned upload file found (not linked to any item): {}", fileUrl);
            });
        } catch (IOException e) {
            log.error("Failed to scan uploads directory", e);
        }
    }

    private String computeFileHash(String imageUrl) {
        try {
            Path filePath = resolveFilePath(imageUrl);
            if (Files.exists(filePath)) {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(Files.readAllBytes(filePath));
                return bytesToHex(hash);
            }
        } catch (IOException | NoSuchAlgorithmException e) {
            log.debug("Could not compute hash for {}", imageUrl, e);
        }
        return null;
    }

    private Path resolveFilePath(String imageUrl) {
        if (imageUrl.startsWith("/uploads/")) {
            String fileName = imageUrl.substring("/uploads/".length());
            return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName).normalize();
        }
        return Paths.get(imageUrl);
    }

    private String extractFileName(String imageUrl) {
        if (imageUrl.startsWith("/uploads/")) {
            return imageUrl.substring("/uploads/".length());
        }
        int lastSlash = imageUrl.lastIndexOf('/');
        return lastSlash >= 0 ? imageUrl.substring(lastSlash + 1) : imageUrl;
    }

    private Long getFileSize(String imageUrl) {
        try {
            Path filePath = resolveFilePath(imageUrl);
            if (Files.exists(filePath)) {
                return Files.size(filePath);
            }
        } catch (IOException e) {
            log.debug("Could not get file size for {}", imageUrl, e);
        }
        return null;
    }

    private String getContentType(String imageUrl) {
        String fileName = extractFileName(imageUrl).toLowerCase();
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
        if (fileName.endsWith(".png")) return "image/png";
        if (fileName.endsWith(".gif")) return "image/gif";
        if (fileName.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}