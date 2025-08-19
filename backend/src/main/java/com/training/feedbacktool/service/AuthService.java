package com.training.feedbacktool.service;

import com.training.feedbacktool.dto.LoginRequest;
import com.training.feedbacktool.dto.LoginResponse;
import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.UserRepository;
import com.training.feedbacktool.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.training.feedbacktool.entity.BlacklistedToken;
import com.training.feedbacktool.repository.BlacklistedTokenRepository;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    public LoginResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getId()
        );
    }


    public String logout(String token) {
    try {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String tokenHash = jwtUtil.hashToken(token);
        if (!blacklistedTokenRepository.existsByTokenHash(tokenHash)) {
            LocalDateTime expiryDate = jwtUtil.getExpiryAsLocalDateTime(token);
            BlacklistedToken blacklistedToken = new BlacklistedToken(tokenHash, expiryDate);
            blacklistedTokenRepository.save(blacklistedToken);
        }
        return "Logout successful";
    } catch (Exception e) {
        return "Logout failed";
    }
}
public boolean isTokenBlacklisted(String token) {
    try {
        String tokenHash = jwtUtil.hashToken(token);
        return blacklistedTokenRepository.existsByTokenHash(tokenHash);
    } catch (Exception e) {
        return false;
    }
}
}