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
import lombok.experimental.SuperBuilder;

/**
 * Admin user extending {@link User}. Demonstrates <b>Inheritance</b> (JOINED
 * strategy) with admin-specific attributes (employeeId, department).
 * <b>Encapsulation</b>: all fields private.
 */
@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {

    @NotBlank(message = "Employee ID is required")
    @Column(name = "employee_id", unique = true, nullable = false, length = 50)
    private String employeeId;

    @NotBlank(message = "Department is required")
    @Column(name = "department", nullable = false, length = 100)
    private String department;
}
