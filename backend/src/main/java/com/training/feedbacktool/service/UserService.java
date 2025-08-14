package com.training.feedbacktool.service;

import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.UserRepository;
import com.training.feedbacktool.dto.CreateUserRequest;
import com.training.feedbacktool.dto.UserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.user.default-role:USER}")
    private String defaultRole;

    public UserService(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse create(CreateUserRequest req) {
        // Check if email already exists
        if (repo.existsByEmailIgnoreCase(req.email())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Build entity from request
        User user = User.builder()
                .email(req.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .name(req.name().trim())
                .role(defaultRole.toUpperCase())
                .build();

        User saved = repo.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getName(),
                saved.getRole(),
                saved.getCreatedAt());
    }
}
