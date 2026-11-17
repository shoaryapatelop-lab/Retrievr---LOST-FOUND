package com.retriever.repository;

import com.retriever.entity.ImportItem;
import com.retriever.entity.ImportItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImportItemRepository extends JpaRepository<ImportItem, Long> {
    List<ImportItem> findByImportJobId(Long importJobId);
    List<ImportItem> findByStatus(ImportItemStatus status);
    Optional<ImportItem> findByFileHash(String fileHash);
    List<ImportItem> findBySuggestedLocation(String location);
}