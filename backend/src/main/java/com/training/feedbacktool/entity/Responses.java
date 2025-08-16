package com.training.feedbacktool.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity

public class Responses {
    @Id  // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String responseText;
    private Instant createdAt = Instant.now();


    public Responses() {}


    public Responses(String responseText) {
        this.responseText = responseText;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResponseText() { return responseText; }
    public void setResponseText(String responseText) { this.responseText = responseText; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

