package com.retriever.mapper;

import com.retriever.dto.ImportItemResponse;
import com.retriever.dto.ImportJobResponse;
import com.retriever.entity.ImportItem;
import com.retriever.entity.ImportJob;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ImportMapper {

    public ImportJobResponse toJobResponse(ImportJob job) {
        if (job == null) return null;
        return ImportJobResponse.builder()
                .id(job.getId())
                .jobName(job.getJobName())
                .status(job.getStatus())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .totalFiles(job.getTotalFiles())
                .importedCount(job.getImportedCount())
                .skippedCount(job.getSkippedCount())
                .failedCount(job.getFailedCount())
                .errorMessage(job.getErrorMessage())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    public ImportItemResponse toResponse(ImportItem item) {
        if (item == null) return null;
        return ImportItemResponse.builder()
                .id(item.getId())
                .importJobId(item.getImportJob() != null ? item.getImportJob().getId() : null)
                .originalFilename(item.getOriginalFilename())
                .storedFilename(item.getStoredFilename())
                .filePath(item.getFilePath())
                .fileHash(item.getFileHash())
                .fileSize(item.getFileSize())
                .contentType(item.getContentType())
                .suggestedLocation(item.getSuggestedLocation())
                .locationConfidence(item.getLocationConfidence())
                .aiTitle(item.getAiTitle())
                .aiDescription(item.getAiDescription())
                .aiCategoryId(item.getAiCategory() != null ? item.getAiCategory().getId() : null)
                .aiCategoryName(item.getAiCategory() != null ? item.getAiCategory().getName() : null)
                .aiKeywords(item.getAiKeywords())
                .aiConfidence(item.getAiConfidence())
                .status(item.getStatus())
                .reviewedBy(item.getReviewedBy() != null ? item.getReviewedBy().getId() : null)
                .reviewerName(item.getReviewedBy() != null
                        ? (item.getReviewedBy().getFirstName() + " " + item.getReviewedBy().getLastName()).trim()
                        : null)
                .reviewedAt(item.getReviewedAt())
                .reviewNotes(item.getReviewNotes())
                .createdItemId(item.getCreatedItem() != null ? item.getCreatedItem().getId() : null)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}