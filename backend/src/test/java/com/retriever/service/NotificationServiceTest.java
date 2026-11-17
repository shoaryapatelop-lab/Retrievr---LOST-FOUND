package com.retriever.service;

import com.retriever.dto.NotificationResponse;
import com.retriever.entity.Notification;
import com.retriever.entity.NotificationType;
import com.retriever.entity.User;
import com.retriever.entity.Student;
import com.retriever.mapper.NotificationMapper;
import com.retriever.repository.NotificationRepository;
import com.retriever.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = Student.builder().id(1L).email("u@example.com").build();
        notification = new Notification();
        notification.setId(5L);
        notification.setUser(user);
        notification.setIsRead(false);
        notification.setTitle("Test");

        when(notificationMapper.toResponse(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            NotificationResponse r = new NotificationResponse();
            r.setId(n.getId());
            r.setIsRead(n.getIsRead());
            return r;
        });
    }

    @Test
    void getNotificationsByUser_returnsList() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(notification));
        List<NotificationResponse> res = notificationService.getNotificationsByUser(1L);
        assertThat(res).hasSize(1);
        assertThat(res.get(0).getId()).isEqualTo(5L);
    }

    @Test
    void getUnreadNotificationsByUser_filtersRead() {
        Notification read = new Notification();
        read.setId(6L);
        read.setUser(user);
        read.setIsRead(true);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(notification, read));
        List<NotificationResponse> res = notificationService.getUnreadNotificationsByUser(1L);
        assertThat(res).hasSize(1);
        assertThat(res.get(0).getId()).isEqualTo(5L);
    }

    @Test
    void getUnreadCount_returnsCount() {
        when(notificationRepository.countByUser_IdAndIsReadFalse(1L)).thenReturn(3L);
        assertThat(notificationService.getUnreadNotificationCount(1L)).isEqualTo(3L);
    }

    @Test
    void markAsRead_success() {
        when(notificationRepository.findById(5L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));
        notificationService.markAsRead(5L);
        assertThat(notification.getIsRead()).isTrue();
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_missing_throws() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> notificationService.markAsRead(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Notification not found");
    }
}
