package com.training.feedbacktool.survey.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSurveyRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 2000) String description,
        Boolean active
) {}
