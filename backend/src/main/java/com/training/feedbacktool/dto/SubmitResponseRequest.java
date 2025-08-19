package com.training.feedbacktool.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SubmitResponseRequest(
        @NotNull(message = "answers are required")
        List<AnswerDTO> answers
) {
    public record AnswerDTO(
            @NotNull Long questionId,
            @NotNull String answerValue // text, rating as string, selected option, etc.
    ) {}
}
