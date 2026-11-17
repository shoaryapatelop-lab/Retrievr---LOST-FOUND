package com.retriever.repository;

import com.retriever.entity.Notification;
import com.retriever.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Notification entity.
 * Demonstrates <b>Abstraction</b> via Spring Data JPA repository interface.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    long countByUser_IdAndIsReadFalse(Long userId);
}