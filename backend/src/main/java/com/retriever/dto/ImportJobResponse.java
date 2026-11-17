package com.retriever.dto;

import com.retriever.entity.ImportJobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportJobResponse {
    private Long id;
    private String jobName;
    private ImportJobStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer totalFiles;
    private Integer importedCount;
    private Integer skippedCount;
    private Integer failedCount;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}