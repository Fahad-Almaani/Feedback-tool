package com.training.feedbacktool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DemoRequest {
    @NotBlank(message = "title is required")
    @Size(min = 3, message = "title must be at least 3 chars")
    private String title;   // <-- add semicolon, remove any stray characters

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
