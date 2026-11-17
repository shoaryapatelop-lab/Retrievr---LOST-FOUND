package com.retriever.service.impl;

import com.retriever.entity.Category;
import com.retriever.repository.CategoryRepository;
import com.retriever.service.ImageAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.Optional;

/**
 * Stub implementation of ImageAnalysisService for development/testing.
 * Returns basic filename-based analysis without actual AI.
 * Replace with GeminiImageAnalysisService when API key is configured.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StubImageAnalysisService implements ImageAnalysisService {

    private final CategoryRepository categoryRepository;

    @Override
    public Optional<ImageAnalysisService.AnalysisResult> analyze(Path imagePath) {
        String filename = imagePath.getFileName().toString();
        log.info("Stub analysis for: {}", filename);

        // Extract basic info from filename
        String baseName = filename;
        int dotIndex = baseName.lastIndexOf('.');
        if (dotIndex > 0) {
            baseName = baseName.substring(0, dotIndex);
        }

        // Clean up WhatsApp filename format
        String cleanName = baseName
                .replace("WhatsApp Image ", "")
                .replace(" at ", " ")
                .replace(".", " ")
                .trim();

        // Default to "Other Items" category
        Category otherCategory = categoryRepository.findByName("Other Items").orElse(null);

        String title = cleanName.length() > 200 ? cleanName.substring(0, 200) : cleanName;
        String description = "Found item from college collection. Original filename: " + filename;
        String keywords = filename.replaceAll("[^a-zA-Z0-9 ]", " ").toLowerCase();

        return Optional.of(new ImageAnalysisService.AnalysisResult(
                title,
                description,
                otherCategory,
                keywords,
                new BigDecimal("0.30") // Low confidence for stub
        ));
    }

    @Override
    public String providerName() {
        return "stub";
    }
}