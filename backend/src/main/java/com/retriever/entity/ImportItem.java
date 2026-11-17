package com.retriever.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Staging entity for imported items awaiting admin review.
 */
@Entity
@Table(name = "import_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = "file_hash")
})
@Getter
@Setter
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class ImportItem extends BaseEntity {

    @NotNull(message = "Import job is required")
    @ManyToOne
    @JoinColumn(name = "import_job_id", nullable = false)
    private ImportJob importJob;

    @NotBlank(message = "Original filename is required")
    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "stored_filename", length = 255)
    private String storedFilename;

    @NotBlank(message = "File path is required")
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @NotBlank(message = "File hash is required")
    @Column(name = "file_hash", nullable = false, length = 64, unique = true)
    private String fileHash;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "suggested_location", length = 100)
    private String suggestedLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_confidence", length = 20)
    private LocationConfidence locationConfidence = LocationConfidence.MANUAL;

    @Column(name = "ai_title", length = 200)
    private String aiTitle;

    @Column(name = "ai_description", length = 2000)
    private String aiDescription;

    @ManyToOne
    @JoinColumn(name = "ai_category_id")
    private Category aiCategory;

    @Column(name = "ai_keywords", length = 500)
    private String aiKeywords;

    @Column(name = "ai_confidence", precision = 5, scale = 2)
    private java.math.BigDecimal aiConfidence;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ImportItemStatus status = ImportItemStatus.PENDING_REVIEW;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", length = 1000)
    private String reviewNotes;

    @ManyToOne
    @JoinColumn(name = "created_item_id")
    private Item createdItem;
}