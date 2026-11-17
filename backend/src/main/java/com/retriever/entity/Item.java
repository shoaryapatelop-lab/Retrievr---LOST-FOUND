package com.retriever.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Abstract item entity demonstrating <b>Inheritance</b> (JOINED strategy) and
 * <b>Encapsulation</b>. FoundItem and LostItem extend this class. All fields
 * are private with validation annotations enforcing business rules (e.g.
 * locationFound is required).
 */
@Entity
@Table(name = "items")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public abstract class Item extends BaseEntity {

    @NotBlank(message = "Title is required")
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @NotBlank(message = "Location found is required")
    @Column(name = "location_found", nullable = false, length = 500)
    private String locationFound;

    @NotNull(message = "Date found is required")
    @Column(name = "date_found", nullable = false)
    private LocalDateTime dateFound;

    @NotNull(message = "Status is required")
    @Column(name = "status", nullable = false, length = 20)
    private ItemStatus status = ItemStatus.AVAILABLE;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "contact_info", length = 500)
    private String contactInfo;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @NotNull(message = "Import source is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "import_source", nullable = false, length = 20)
    private ImportSource importSource = ImportSource.MANUAL;
}
