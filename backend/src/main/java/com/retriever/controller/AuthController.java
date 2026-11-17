package com.retriever.controller;

import com.retriever.dto.AuthResponse;
import com.retriever.dto.ForgotPasswordRequest;
import com.retriever.dto.LoginRequest;
import com.retriever.dto.RegisterRequest;
import com.retriever.dto.UserProfileResponse;
import com.retriever.entity.Admin;
import com.retriever.entity.Student;
import com.retriever.entity.User;
import com.retriever.repository.UserRepository;
import com.retriever.service.AuthService;
import com.retriever.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT is stateless; client discards token. Endpoint provided for API completeness.
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "If an account exists for that email, a password reset link has been sent."));
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(toProfile(currentUserService.get(authentication)));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody UserProfileResponse request, Authentication authentication) {
        User user = currentUserService.get(authentication);
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null && !request.getLastName().isBlank()) user.setLastName(request.getLastName().trim());
        if (user instanceof Student student) {
            if (request.getDepartment() != null) student.setDepartment(request.getDepartment());
            if (request.getContact() != null) student.setContact(request.getContact());
        } else if (user instanceof Admin admin) {
            if (request.getDepartment() != null) admin.setDepartment(request.getDepartment());
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(toProfile(saved));
    }

    private UserProfileResponse toProfile(User user) {
        UserProfileResponse.UserProfileResponseBuilder b = UserProfileResponse.builder()
                .id(user.getId()).email(user.getEmail()).firstName(user.getFirstName())
                .lastName(user.getLastName()).role(user.getRole());
        if (user instanceof Student s) {
            b.rollNumber(s.getRollNumber()).department(s.getDepartment()).contact(s.getContact());
        } else if (user instanceof Admin a) {
            b.employeeId(a.getEmployeeId()).department(a.getDepartment());
        }
        return b.build();
    }
}