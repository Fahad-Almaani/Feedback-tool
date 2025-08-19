package com.training.feedbacktool.controller;

import com.training.feedbacktool.common.ApiResponse;
import com.training.feedbacktool.service.AuthService;
import com.training.feedbacktool.dto.LoginRequest;
import com.training.feedbacktool.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173", "http://localhost:4173",
        "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:4173" }, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse loginResponse = authService.login(request);
            ApiResponse<LoginResponse> response = ApiResponse.success(loginResponse, "Login successful");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<LoginResponse> response = ApiResponse.error("Invalid credentials: " + e.getMessage(),
                    HttpStatus.UNAUTHORIZED);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            ApiResponse<LoginResponse> response = ApiResponse.error("Login failed: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
            return ResponseEntity.internalServerError().body(response);
        }
    }
}