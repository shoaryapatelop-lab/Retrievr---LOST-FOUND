package com.retriever.repository;

import com.retriever.entity.Item;
import com.retriever.entity.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {
    List<Item> findByReporterId(Long reporterId);
    List<Item> findByStatus(ItemStatus status);
}