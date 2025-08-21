package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.time.Instant;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByResetTokenAndResetTokenExpiresAtAfter(String resetToken, Instant now);
}
