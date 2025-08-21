package com.training.feedbacktool.controller;

import com.training.feedbacktool.common.ApiResponse;
import com.training.feedbacktool.service.AuthService;
import com.training.feedbacktool.dto.LoginRequest;
import com.training.feedbacktool.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.training.feedbacktool.dto.ForgotPasswordRequest;
import com.training.feedbacktool.dto.ResetPasswordRequest;

import java.util.Optional;


@RestController
@RequestMapping("/api/auth")
// CORS is now handled globally by CorsConfig
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
    }// Start password reset flow (always 204 to avoid user enumeration)
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest body) {
        // This delegates to your service layer (added in earlier steps)
        authService.requestPasswordReset(body);
        return ResponseEntity.noContent().build(); // 204
    }

    // Complete password reset using the token
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
        authService.resetPassword(body);
        return ResponseEntity.noContent().build(); // 204
    }
}