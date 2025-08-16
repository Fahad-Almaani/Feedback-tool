package com.training.feedbacktool.entity;

import jakarta.persistence.*;
import java.time.Instant;


@Entity

public class Answers {
    @Id  // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String answerText;

    private Instant createdAt = Instant.now();


    public Answers() {}

    // Constructor for creating new answers
    public Answers(String answerText) {
        this.answerText = answerText;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}


