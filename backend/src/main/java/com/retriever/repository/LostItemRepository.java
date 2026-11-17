package com.retriever.repository;

import com.retriever.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for LostItem entity.
 * Demonstrates <b>Abstraction</b> via Spring Data JPA repository interface.
 */
@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    List<LostItem> findByReporterId(Long reporterId);
}