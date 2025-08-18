package com.training.feedbacktool.controller;

import com.training.feedbacktool.service.UserService;
import com.training.feedbacktool.dto.CreateUserRequest;
import com.training.feedbacktool.dto.CreateUserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping("/create")
    // Removed @PreAuthorize - now allows unauthenticated user creation
    public ResponseEntity<CreateUserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        CreateUserResponse created = service.create(req);
        return ResponseEntity.created(URI.create("/users/" + created.userId())).body(created);
    }
}
