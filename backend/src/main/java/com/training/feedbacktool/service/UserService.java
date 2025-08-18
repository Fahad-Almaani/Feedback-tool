package com.training.feedbacktool.service;

import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.UserRepository;
import com.training.feedbacktool.dto.CreateUserRequest;
import com.training.feedbacktool.dto.CreateUserResponse;
import com.training.feedbacktool.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.user.default-role:USER}")
    private String defaultRole;

    public UserService(UserRepository repo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public CreateUserResponse create(CreateUserRequest req) {
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

        // Generate JWT token
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getId());

        return new CreateUserResponse(
                token,
                saved.getEmail(),
                saved.getName(),
                saved.getRole(),
                saved.getId());
    }
}
