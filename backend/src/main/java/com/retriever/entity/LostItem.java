package com.retriever.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Lost item extending {@link Item}. Demonstrates <b>Inheritance</b> (JOINED
 * strategy). Adds lost-item-specific attribute lastSeenLocation.
 * <b>Encapsulation</b>: all fields private.
 */
@Entity
@Table(name = "lost_items")
@Getter
@Setter
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class LostItem extends Item {

    @Column(name = "last_seen_location", length = 500)
    private String lastSeenLocation;
}
