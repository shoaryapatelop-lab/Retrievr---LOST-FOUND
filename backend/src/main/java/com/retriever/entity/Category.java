package com.retriever.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Category entity for classifying items. Demonstrates <b>Encapsulation</b>
 * (all fields private). Admin manages categories via this entity.
 */
@Entity
@Table(name = "categories", uniqueConstraints = {
        @jakarta.persistence.UniqueConstraint(columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Category extends BaseEntity {

    @NotBlank(message = "Category name is required")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;
}
