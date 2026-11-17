package com.retriever.service;

import com.retriever.dto.ApproveImportRequest;
import com.retriever.dto.ImportDiscoveredItem;
import com.retriever.dto.ImportItemResponse;
import com.retriever.dto.ImportJobResponse;
import com.retriever.dto.ImportStatsResponse;
import com.retriever.dto.RejectImportRequest;

import java.util.List;

/**
 * Service interface for importing real found items from college collection.
 */
public interface ImportService {

    /**
     * Discover images in the uploads directory and associate with locations.
     */
    List<ImportDiscoveredItem> discoverImages();

    /**
     * Start a new import job for discovered images.
     */
    ImportJobResponse startImportJob(String jobName);

    /**
     * Analyze and stage an image for review.
     */
    ImportItemResponse analyzeAndStage(Long importJobId, String filePath, String suggestedLocation);

    /**
     * Get all items for an import job.
     */
    List<ImportItemResponse> getImportJobItems(Long importJobId);

    /**
     * Get items pending review.
     */
    List<ImportItemResponse> getPendingReviewItems();

    /**
     * Approve an import item and create a FoundItem.
     */
    ImportItemResponse approveImport(Long importItemId, ApproveImportRequest request, Long reviewerId);

    /**
     * Reject an import item.
     */
    ImportItemResponse rejectImport(Long importItemId, RejectImportRequest request, Long reviewerId);

    /**
     * Get import statistics for admin dashboard.
     */
    ImportStatsResponse getImportStats();

    /**
     * Complete an import job.
     */
    ImportJobResponse completeImportJob(Long importJobId);
}