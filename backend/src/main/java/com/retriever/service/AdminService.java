package com.retriever.service;

import com.retriever.dto.ClaimResponse;
import com.retriever.dto.DashboardStats;
import com.retriever.dto.ItemResponse;
import com.retriever.dto.MatchResponse;
import com.retriever.dto.NotificationResponse;
import com.retriever.dto.UserProfileResponse;

import java.util.List;
import java.util.Map;

public interface AdminService {
    DashboardStats getDashboardStats();
    Map<String, Object> getUserDashboard(Long userId);
    List<UserProfileResponse> getAllUsers();
    List<ItemResponse> getAllItems();
    List<ItemResponse> getAllLostItems();
    List<ItemResponse> getAllFoundItems();
}