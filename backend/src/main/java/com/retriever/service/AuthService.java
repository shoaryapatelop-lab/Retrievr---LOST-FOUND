package com.retriever.service;

import com.retriever.dto.AuthResponse;
import com.retriever.dto.LoginRequest;
import com.retriever.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void requestPasswordReset(String email);
}