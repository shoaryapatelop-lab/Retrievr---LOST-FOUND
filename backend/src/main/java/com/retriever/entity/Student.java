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
 * Student user extending {@link User}. Demonstrates <b>Inheritance</b> (JOINED
 * strategy) with student-specific attributes (rollNumber, department, contact).
 * <b>Encapsulation</b>: all fields private.
 */
@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Student extends User {

    @NotBlank(message = "Roll number is required")
    @Column(name = "roll_number", unique = true, nullable = false, length = 50)
    private String rollNumber;

    @NotBlank(message = "Department is required")
    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "contact", length = 20)
    private String contact;
}
