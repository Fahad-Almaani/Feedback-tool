package com.training.feedbacktool.survey.api.dto;

import java.time.Instant;

public record SurveyResponse(
        Long id,
        String title,
        String description,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
