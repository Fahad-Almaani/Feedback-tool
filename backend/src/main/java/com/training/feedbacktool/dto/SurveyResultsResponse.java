package com.training.feedbacktool.dto;

import java.time.Instant;
import java.util.List;

public record SurveyResultsResponse(
        Long surveyId,
        String surveyTitle,
        String surveyDescription,
        Instant surveyCreatedAt,
        int totalResponses,
        int totalQuestions,
        List<QuestionResultDTO> questionResults,
        List<RespondentDTO> respondents) {

    public record QuestionResultDTO(
            Long questionId,
            String questionText,
            String questionType,
            Integer orderNumber,
            Boolean required,
            int totalAnswers,
            List<AnswerSummaryDTO> answers) {
    }

    public record AnswerSummaryDTO(
            Long answerId,
            String answerText,
            Instant submittedAt,
            RespondentInfoDTO respondent) {
    }

    public record RespondentDTO(
            String respondentId, // "user_123" or "anonymous_1", "anonymous_2" etc.
            String name,
            String email,
            boolean isAnonymous,
            int totalAnswersSubmitted,
            Instant firstSubmissionAt,
            List<ResponseDetailDTO> responses) {
    }

    public record ResponseDetailDTO(
            Long questionId,
            String questionText,
            String answerText,
            Instant submittedAt) {
    }

    public record RespondentInfoDTO(
            String respondentId,
            String name,
            String email,
            boolean isAnonymous) {
    }
}