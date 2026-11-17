package com.retriever.service;

import com.retriever.dto.NotificationResponse;
import com.retriever.entity.NotificationType;
import com.retriever.entity.User;

import java.util.List;

/**
 * Service interface for notification operations.
 * Demonstrates <b>Abstraction</b> via service interface.
 */
public interface NotificationService {
    void createNotification(User user, NotificationType type, String title, String message,
                            String relatedEntityType, Long relatedEntityId);

    List<NotificationResponse> getNotificationsByUser(Long userId);

    List<NotificationResponse> getUnreadNotificationsByUser(Long userId);

    long getUnreadNotificationCount(Long userId);

    void markAsRead(Long notificationId);
}