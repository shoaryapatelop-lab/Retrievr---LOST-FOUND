package com.retriever.repository;

import com.retriever.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {
    List<ItemImage> findByItemId(Long itemId);
    void deleteByItemId(Long itemId);
    Optional<ItemImage> findByImageUrl(String imageUrl);
}