package com.retriever.service.impl;

import com.retriever.dto.ClaimResponse;
import com.retriever.dto.DashboardStats;
import com.retriever.dto.ItemResponse;
import com.retriever.dto.MatchResponse;
import com.retriever.dto.NotificationResponse;
import com.retriever.dto.UserProfileResponse;
import com.retriever.entity.*;
import com.retriever.mapper.ClaimMapper;
import com.retriever.mapper.ItemMapper;
import com.retriever.mapper.MatchMapper;
import com.retriever.mapper.NotificationMapper;
import com.retriever.repository.*;
import com.retriever.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;
    private final ItemMatchRepository itemMatchRepository;
    private final ItemMapper itemMapper;
    private final ClaimMapper claimMapper;
    private final NotificationMapper notificationMapper;
    private final MatchMapper matchMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalLostItems = lostItemRepository.count();
        long totalFoundItems = foundItemRepository.count();
        long totalClaims = claimRepository.count();
        long pendingClaims = claimRepository.findByStatusOrderByCreatedAtAsc(ClaimStatus.PENDING).size();
        long resolvedCases = claimRepository.findByStatusOrderByCreatedAtAsc(ClaimStatus.APPROVED).size();
        long returnedItems = itemRepository.findByStatus(ItemStatus.RETURNED).size();
        long availableItems = itemRepository.findByStatus(ItemStatus.AVAILABLE).size();

        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalLostItems(totalLostItems)
                .totalFoundItems(totalFoundItems)
                .totalClaims(totalClaims)
                .pendingClaims(pendingClaims)
                .resolvedCases(resolvedCases)
                .returnedItems(returnedItems)
                .availableItems(availableItems)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserDashboard(Long userId) {
        Map<String, Object> data = new HashMap<>();
        data.put("myLostItems", lostItemRepository.findByReporterId(userId).stream().map(itemMapper::toResponse).toList());
        data.put("myFoundItems", foundItemRepository.findByReporterId(userId).stream().map(itemMapper::toResponse).toList());
        data.put("myClaims", claimMapper.toResponseList(claimRepository.findByClaimerId(userId)));
        data.put("notifications", notificationMapper.toResponseList(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)));
        List<ItemMatch> matches = new ArrayList<>();
        itemRepository.findByReporterId(userId).forEach(item -> {
            matches.addAll(itemMatchRepository.findByLostItemIdOrderByMatchScoreDesc(item.getId()));
            matches.addAll(itemMatchRepository.findByFoundItemIdOrderByMatchScoreDesc(item.getId()));
        });
        data.put("potentialMatches", matchMapper.toResponseList(matches));
        return data;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toProfile).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getAllItems() {
        return itemRepository.findAll().stream().map(itemMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getAllLostItems() {
        return lostItemRepository.findAll().stream().map(itemMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getAllFoundItems() {
        return foundItemRepository.findAll().stream().map(itemMapper::toResponse).collect(Collectors.toList());
    }

    private UserProfileResponse toProfile(User user) {
        UserProfileResponse.UserProfileResponseBuilder b = UserProfileResponse.builder()
                .id(user.getId()).email(user.getEmail())
                .firstName(user.getFirstName()).lastName(user.getLastName()).role(user.getRole());
        if (user instanceof Student s) {
            b.rollNumber(s.getRollNumber()).department(s.getDepartment()).contact(s.getContact());
        } else if (user instanceof Admin a) {
            b.employeeId(a.getEmployeeId()).department(a.getDepartment());
        }
        return b.build();
    }
}