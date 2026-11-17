package com.retriever.dto;

import com.retriever.entity.LocationConfidence;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportDiscoveredItem {
    private String originalFilename;
    private String filePath;
    private Long fileSize;
    private String contentType;
    private String suggestedLocation;
    private LocationConfidence locationConfidence;
    private String locationReason;
    private boolean alreadyImported;
    private String existingFileHash;
}