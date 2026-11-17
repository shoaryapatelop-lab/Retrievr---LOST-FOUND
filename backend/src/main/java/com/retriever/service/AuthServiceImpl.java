package com.retriever.service;

import com.retriever.dto.AuthResponse;
import com.retriever.dto.LoginRequest;
import com.retriever.dto.RegisterRequest;
import com.retriever.entity.Admin;
import com.retriever.entity.Student;
import com.retriever.entity.User;
import com.retriever.repository.AdminRepository;
import com.retriever.repository.StudentRepository;
import com.retriever.repository.UserRepository;
import com.retriever.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request == null || request.getEmail() == null) {
            throw new IllegalArgumentException("Registration data is required");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (!email.endsWith("@iiita.ac.in")) {
            throw new IllegalArgumentException("Retrievr is exclusively available to IIITA members. Please register using your official @iiita.ac.in email address.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }

        User user;
        if (request.getRole() == RegisterRequest.Role.STUDENT) {
            if (request.getRollNumber() == null || request.getRollNumber().isBlank()) {
                throw new IllegalArgumentException("Roll number is required for students");
            }
            if (studentRepository.existsByRollNumber(request.getRollNumber().trim())) {
                throw new IllegalArgumentException("Roll number already registered");
            }
            Student student = Student.builder()
                    .email(email)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role("STUDENT")
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .rollNumber(request.getRollNumber().trim())
                    .department(request.getDepartment() == null ? "" : request.getDepartment().trim())
                    .contact(request.getContact())
                    .build();
            user = studentRepository.save(student);
        } else {
            if (request.getEmployeeId() == null || request.getEmployeeId().isBlank()) {
                throw new IllegalArgumentException("Employee ID is required for admins");
            }
            if (adminRepository.existsByEmployeeId(request.getEmployeeId().trim())) {
                throw new IllegalArgumentException("Employee ID already registered");
            }
            Admin admin = Admin.builder()
                    .email(email)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role("ADMIN")
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .employeeId(request.getEmployeeId().trim())
                    .department(request.getDepartment() == null ? "" : request.getDepartment().trim())
                    .build();
            user = adminRepository.save(admin);
        }

        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    @Override
    public void requestPasswordReset(String email) {
        // No email delivery configured. Intentionally do nothing to avoid account enumeration.
        // Controller returns a generic success response regardless of existence.
        if (email != null) {
            userRepository.findByEmail(email.trim().toLowerCase()); // lookup without side effects
        }
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .id(user.getId())
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}