package com.retriever.controller;

import com.retriever.dto.ApproveImportRequest;
import com.retriever.dto.ImportDiscoveredItem;
import com.retriever.dto.ImportItemResponse;
import com.retriever.dto.ImportJobResponse;
import com.retriever.dto.ImportStatsResponse;
import com.retriever.dto.RejectImportRequest;
import com.retriever.service.CurrentUserService;
import com.retriever.service.ImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/import")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ImportController {

    private final ImportService importService;
    private final CurrentUserService currentUserService;

    @GetMapping("/discover")
    public ResponseEntity<List<ImportDiscoveredItem>> discoverImages() {
        return ResponseEntity.ok(importService.discoverImages());
    }

    @PostMapping("/jobs")
    public ResponseEntity<ImportJobResponse> startImportJob(@RequestParam String jobName) {
        return ResponseEntity.ok(importService.startImportJob(jobName));
    }

    @PostMapping("/jobs/{jobId}/analyze")
    public ResponseEntity<ImportItemResponse> analyzeAndStage(
            @PathVariable Long jobId,
            @RequestParam String filePath,
            @RequestParam(required = false) String suggestedLocation) {
        return ResponseEntity.ok(importService.analyzeAndStage(jobId, filePath, suggestedLocation));
    }

    @GetMapping("/jobs/{jobId}/items")
    public ResponseEntity<List<ImportItemResponse>> getJobItems(@PathVariable Long jobId) {
        return ResponseEntity.ok(importService.getImportJobItems(jobId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ImportItemResponse>> getPendingReview() {
        return ResponseEntity.ok(importService.getPendingReviewItems());
    }

    @PostMapping("/items/{itemId}/approve")
    public ResponseEntity<ImportItemResponse> approveImport(
            @PathVariable Long itemId,
            @Valid @RequestBody ApproveImportRequest request,
            Authentication authentication) {
        Long reviewerId = currentUserService.id(authentication);
        return ResponseEntity.ok(importService.approveImport(itemId, request, reviewerId));
    }

    @PostMapping("/items/{itemId}/reject")
    public ResponseEntity<ImportItemResponse> rejectImport(
            @PathVariable Long itemId,
            @Valid @RequestBody RejectImportRequest request,
            Authentication authentication) {
        Long reviewerId = currentUserService.id(authentication);
        return ResponseEntity.ok(importService.rejectImport(itemId, request, reviewerId));
    }

    @GetMapping("/stats")
    public ResponseEntity<ImportStatsResponse> getImportStats() {
        return ResponseEntity.ok(importService.getImportStats());
    }

    @PostMapping("/jobs/{jobId}/complete")
    public ResponseEntity<ImportJobResponse> completeJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(importService.completeImportJob(jobId));
    }

    @PostMapping("/bulk-analyze")
    public ResponseEntity<Map<String, Object>> bulkAnalyze(
            @RequestParam Long jobId,
            @RequestBody List<String> filePaths) {
        Map<String, Object> results = new java.util.HashMap<>();
        int success = 0;
        int failed = 0;
        for (String filePath : filePaths) {
            try {
                importService.analyzeAndStage(jobId, filePath, null);
                success++;
            } catch (Exception e) {
                failed++;
            }
        }
        results.put("success", success);
        results.put("failed", failed);
        results.put("total", filePaths.size());
        return ResponseEntity.ok(results);
    }
}