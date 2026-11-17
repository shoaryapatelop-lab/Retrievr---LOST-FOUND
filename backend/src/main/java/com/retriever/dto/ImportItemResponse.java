package com.retriever.dto;

import com.retriever.entity.ImportItemStatus;
import com.retriever.entity.LocationConfidence;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportItemResponse {
    private Long id;
    private Long importJobId;
    private String originalFilename;
    private String storedFilename;
    private String filePath;
    private String fileHash;
    private Long fileSize;
    private String contentType;
    private String suggestedLocation;
    private LocationConfidence locationConfidence;
    private String aiTitle;
    private String aiDescription;
    private Long aiCategoryId;
    private String aiCategoryName;
    private String aiKeywords;
    private BigDecimal aiConfidence;
    private ImportItemStatus status;
    private Long reviewedBy;
    private String reviewerName;
    private LocalDateTime reviewedAt;
    private String reviewNotes;
    private Long createdItemId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}