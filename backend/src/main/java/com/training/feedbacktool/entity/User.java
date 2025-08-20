package com.training.feedbacktool.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA requirement
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String role;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    // ---- Password reset support ----
    @Column(name = "reset_token", length = 120)
    private String resetToken;                 // one-time token (null when not in use)

    @Column(name = "reset_token_expires_at")
    private Instant resetTokenExpiresAt;       // token expiry time


    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}