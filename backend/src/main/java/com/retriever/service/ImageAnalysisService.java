package com.retriever.service;

import com.retriever.entity.Category;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.Optional;

/**
 * Service interface for AI-powered image analysis.
 * Implementations can use Gemini Vision, OpenAI Vision, or other providers.
 */
public interface ImageAnalysisService {

    /**
     * Result of image analysis.
     */
    record AnalysisResult(
            String title,
            String description,
            Category suggestedCategory,
            String keywords,
            BigDecimal confidence
    ) {}

    /**
     * Analyze an image file and return structured information.
     *
     * @param imagePath path to the image file
     * @return analysis result, or empty if analysis failed
     */
    Optional<AnalysisResult> analyze(Path imagePath);

    /**
     * Get the name of the analysis provider (e.g., "gemini", "openai", "stub").
     */
    String providerName();
}