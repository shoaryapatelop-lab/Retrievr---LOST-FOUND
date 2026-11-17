package com.retriever.controller;

import com.retriever.dto.DashboardStats;
import com.retriever.dto.ItemResponse;
import com.retriever.dto.UserProfileResponse;
import com.retriever.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin operations.
 * Demonstrates layered architecture: Controller -> Service -> Repository.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/items")
    public ResponseEntity<List<ItemResponse>> getAllItems() {
        return ResponseEntity.ok(adminService.getAllItems());
    }

    @GetMapping("/items/lost")
    public ResponseEntity<List<ItemResponse>> getAllLostItems() {
        return ResponseEntity.ok(adminService.getAllLostItems());
    }

    @GetMapping("/items/found")
    public ResponseEntity<List<ItemResponse>> getAllFoundItems() {
        return ResponseEntity.ok(adminService.getAllFoundItems());
    }
}