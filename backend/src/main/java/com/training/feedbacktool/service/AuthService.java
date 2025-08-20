package com.training.feedbacktool.service;

import com.training.feedbacktool.dto.LoginRequest;
import com.training.feedbacktool.dto.LoginResponse;
import com.training.feedbacktool.dto.ForgotPasswordRequest;   // <-- added
import com.training.feedbacktool.dto.ResetPasswordRequest;     // <-- added
import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.UserRepository;
import com.training.feedbacktool.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
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

    // ---------- NEW: DTO wrappers so the controller compiles ----------
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest req) {
        // Delegate to existing method; ignore Optional to avoid user enumeration
        startPasswordReset(req.email());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        resetPassword(req.token(), req.newPassword());
    }
    // ------------------------------------------------------------------

    // ------------------- FORGOT PASSWORD -------------------
    /**
     * Generates a one-time reset token and expiry and stores them on the user.
     * In a real system you would email the reset link to the user. For now we
     * return the token so it can be tested easily in Postman.
     *
     * @return the reset token (for DEV/testing)
     */
    @Transactional
    public Optional<String> startPasswordReset(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(user -> {
                    String token = UUID.randomUUID().toString();
                    user.setResetToken(token);
                    user.setResetTokenExpiresAt(Instant.now().plus(Duration.ofHours(1)));
                    userRepository.save(user);

                    // For development visibility (don’t log secrets in prod)
                    log.info("Password reset token for {}: {}", email, token);

                    return token;
                });
        // If email not found -> Optional.empty()
    }

    // ------------------- RESET PASSWORD -------------------
    /**
     * Validates the token (and its expiry), sets a new password, and clears the token.
     */
    @Transactional
    public void resetPassword(String token, String newPlainPassword) {
        User user = userRepository
                .findByResetTokenAndResetTokenExpiresAtAfter(token, Instant.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        user.setPasswordHash(passwordEncoder.encode(newPlainPassword));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }
}
