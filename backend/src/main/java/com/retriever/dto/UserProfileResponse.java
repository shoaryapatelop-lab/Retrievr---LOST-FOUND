package com.retriever.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for returning user profile data.
 * Demonstrates <b>Encapsulation</b> in DTO layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String rollNumber; // For students
    private String employeeId; // For admins
    private String department;
    private String contact;
}