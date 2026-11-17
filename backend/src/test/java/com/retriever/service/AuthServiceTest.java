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
import com.retriever.service.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private AdminRepository adminRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(jwtService.generateToken(any(User.class))).thenReturn("token-123");
    }

    @Test
    void registerStudent_success() {
        when(userRepository.existsByEmail("student@iiita.ac.in")).thenReturn(false);
        when(studentRepository.existsByRollNumber("CS-1")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(inv -> {
            Student s = inv.getArgument(0);
            s.setId(10L);
            return s;
        });

        RegisterRequest req = new RegisterRequest();
        req.setEmail("Student@iiita.ac.in");
        req.setPassword("Password123!");
        req.setFirstName("Jane");
        req.setLastName("Doe");
        req.setRole(RegisterRequest.Role.STUDENT);
        req.setRollNumber("CS-1");
        req.setDepartment("CS");
        req.setContact("123");

        AuthResponse res = authService.register(req);

        assertThat(res.getId()).isEqualTo(10L);
        assertThat(res.getToken()).isEqualTo("token-123");
        assertThat(res.getEmail()).isEqualTo("student@iiita.ac.in");
        assertThat(res.getRole()).isEqualTo("STUDENT");
        verify(userRepository).existsByEmail("student@iiita.ac.in");
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void registerStudent_duplicateEmail_throws() {
        when(userRepository.existsByEmail("dup@iiita.ac.in")).thenReturn(true);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("dup@iiita.ac.in");
        req.setPassword("Password123!");
        req.setFirstName("Jane");
        req.setLastName("Doe");
        req.setRole(RegisterRequest.Role.STUDENT);
        req.setRollNumber("CS-2");

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already registered");
        verify(studentRepository, never()).save(any());
    }

    @Test
    void registerStudent_duplicateRollNumber_throws() {
        when(userRepository.existsByEmail("new@iiita.ac.in")).thenReturn(false);
        when(studentRepository.existsByRollNumber("CS-3")).thenReturn(true);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("new@iiita.ac.in");
        req.setPassword("Password123!");
        req.setFirstName("Jane");
        req.setLastName("Doe");
        req.setRole(RegisterRequest.Role.STUDENT);
        req.setRollNumber("CS-3");

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Roll number already registered");
    }

    @Test
    void registerAdmin_success() {
        when(userRepository.existsByEmail("admin@iiita.ac.in")).thenReturn(false);
        when(adminRepository.existsByEmployeeId("E-1")).thenReturn(false);
        when(adminRepository.save(any(Admin.class))).thenAnswer(inv -> {
            Admin a = inv.getArgument(0);
            a.setId(20L);
            return a;
        });

        RegisterRequest req = new RegisterRequest();
        req.setEmail("admin@iiita.ac.in");
        req.setPassword("Password123!");
        req.setFirstName("Admin");
        req.setLastName("User");
        req.setRole(RegisterRequest.Role.ADMIN);
        req.setEmployeeId("E-1");
        req.setDepartment("IT");

        AuthResponse res = authService.register(req);

        assertThat(res.getId()).isEqualTo(20L);
        assertThat(res.getRole()).isEqualTo("ADMIN");
        verify(adminRepository).save(any(Admin.class));
    }

    @Test
    void register_missingRole_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("x@iiita.ac.in");
        req.setPassword("Password123!");
        req.setFirstName("X");
        req.setLastName("Y");
        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Role is required");
    }

    @Test
    void login_success() {
        User user = Student.builder().id(7L).email("u@iiita.ac.in").firstName("U").lastName("V").role("STUDENT").build();
        when(userRepository.findByEmail("u@iiita.ac.in")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest();
        req.setEmail("u@iiita.ac.in");
        req.setPassword("Password123!");

        AuthResponse res = authService.login(req);

        assertThat(res.getId()).isEqualTo(7L);
        assertThat(res.getToken()).isEqualTo("token-123");
        assertThat(res.getEmail()).isEqualTo("u@iiita.ac.in");
    }

    @Test
    void login_unknownUser_throws() {
        when(userRepository.findByEmail("nope@iiita.ac.in")).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setEmail("nope@iiita.ac.in");
        req.setPassword("Password123!");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void requestPasswordReset_doesNotThrow() {
        when(userRepository.findByEmail("any@iiita.ac.in")).thenReturn(Optional.empty());
        authService.requestPasswordReset("any@iiita.ac.in");
        verify(userRepository).findByEmail("any@iiita.ac.in");
    }
}
