package com.training.feedbacktool.controller;

import com.training.feedbacktool.common.ApiResponse;
import com.training.feedbacktool.service.UserService;
import com.training.feedbacktool.dto.CreateUserRequest;
import com.training.feedbacktool.dto.CreateUserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping("/create")
    // Removed @PreAuthorize - now allows unauthenticated user creation
    public ResponseEntity<ApiResponse<CreateUserResponse>> create(@Valid @RequestBody CreateUserRequest req) {
        try {
            CreateUserResponse created = service.create(req);
            ApiResponse<CreateUserResponse> response = ApiResponse.success(created, "User created successfully",
                    HttpStatus.CREATED);
            return ResponseEntity.created(URI.create("/users/" + created.userId())).body(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<CreateUserResponse> response = ApiResponse.error("Failed to create user: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<CreateUserResponse> response = ApiResponse.error("User creation failed: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
