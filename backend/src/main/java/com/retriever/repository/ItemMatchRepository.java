package com.retriever.repository;

import com.retriever.entity.ItemMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ItemMatch entity.
 * Demonstrates <b>Abstraction</b> via Spring Data JPA repository interface.
 */
@Repository
public interface ItemMatchRepository extends JpaRepository<ItemMatch, Long> {
    List<ItemMatch> findByLostItemIdOrderByMatchScoreDesc(Long lostItemId);

    List<ItemMatch> findByFoundItemIdOrderByMatchScoreDesc(Long foundItemId);

    List<ItemMatch> findByLostItemIdAndIsNotifiedFalse(Long lostItemId);

    boolean existsByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);
}