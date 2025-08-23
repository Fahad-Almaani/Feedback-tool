package com.training.feedbacktool.dto;

public record UserAnswerDTO(
        Long questionId,
        String questionText,
        String questionType,
        String answerText) {
}