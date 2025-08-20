package com.training.feedbacktool.dto;

public record UserDashboardStats(
        int completedSurveysCount,
        int pendingSurveysCount,
        int totalResponses,
        int completionRate) {
}