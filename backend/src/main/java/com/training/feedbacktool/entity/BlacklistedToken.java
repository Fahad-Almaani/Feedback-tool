package com.training.feedbacktool.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
    // Constructors
    public BlacklistedToken() {}
    public BlacklistedToken(String tokenHash, LocalDateTime expiryDate) {
        this.tokenHash = tokenHash;
        this.expiryDate = expiryDate;
    }
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}