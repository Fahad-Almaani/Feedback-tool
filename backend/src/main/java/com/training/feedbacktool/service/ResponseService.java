package com.training.feedbacktool.service;

import com.training.feedbacktool.dto.SubmitResponseRequest;
import com.training.feedbacktool.entity.Answer;
import com.training.feedbacktool.entity.Question;
import com.training.feedbacktool.entity.Survey;
import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.AnswersRepository;
import com.training.feedbacktool.repository.SurveyRepository;
import com.training.feedbacktool.repository.UserRepository;
import com.training.feedbacktool.util.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResponseService {

    private final SurveyRepository surveyRepository;
    private final AnswersRepository answersRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public ResponseService(SurveyRepository surveyRepository,
            AnswersRepository answersRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil) {
        this.surveyRepository = surveyRepository;
        this.answersRepository = answersRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public void submitSurveyResponse(Long surveyId, SubmitResponseRequest request, String authToken) {
        // Get the survey
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new IllegalArgumentException("Survey not found with id: " + surveyId));

        // Check if survey is active
        if (!"ACTIVE".equalsIgnoreCase(survey.getStatus())) {
            throw new IllegalStateException("Survey is not accepting responses");
        }

        // Extract user from token if authenticated
        User user = null;
        if (authToken != null && authToken.startsWith("Bearer ")) {
            try {
                String jwt = authToken.substring(7);
                String email = jwtUtil.extractEmail(jwt);
                if (email != null && !jwtUtil.isTokenExpired(jwt)) {
                    user = userRepository.findByEmailIgnoreCase(email).orElse(null);
                }
            } catch (Exception e) {
                // Token is invalid, proceed as anonymous
            }
        }

        // Create a map of questions by ID for validation
        Map<Long, Question> questionsById = survey.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        // Validate required questions
        validateRequiredQuestions(questionsById, request);

        // Save answers
        for (SubmitResponseRequest.AnswerDTO answerDto : request.answers()) {
            Question question = questionsById.get(answerDto.questionId());
            if (question == null) {
                throw new IllegalArgumentException(
                        "Question " + answerDto.questionId() + " is not part of survey " + surveyId);
            }

            // Skip empty answers for non-required questions
            if (answerDto.answerValue() == null || answerDto.answerValue().trim().isEmpty()) {
                if (Boolean.TRUE.equals(question.getRequired())) {
                    throw new IllegalArgumentException(
                            "Answer is required for question: " + question.getQuestionText());
                }
                continue;
            }

            Answer answer = new Answer();
            answer.setQuestion(question);
            answer.setAnswerText(answerDto.answerValue().trim());
            answer.setUser(user); // null for anonymous responses

            answersRepository.save(answer);
        }
    }

    private void validateRequiredQuestions(Map<Long, Question> questionsById, SubmitResponseRequest request) {
        // Get all required question IDs
        var requiredQuestionIds = questionsById.values().stream()
                .filter(q -> Boolean.TRUE.equals(q.getRequired()))
                .map(Question::getId)
                .collect(Collectors.toSet());

        // Get answered question IDs (with non-empty answers)
        var answeredQuestionIds = request.answers().stream()
                .filter(a -> a.answerValue() != null && !a.answerValue().trim().isEmpty())
                .map(SubmitResponseRequest.AnswerDTO::questionId)
                .collect(Collectors.toSet());

        // Check if all required questions are answered
        requiredQuestionIds.removeAll(answeredQuestionIds);
        if (!requiredQuestionIds.isEmpty()) {
            var missingQuestions = requiredQuestionIds.stream()
                    .map(questionsById::get)
                    .map(Question::getQuestionText)
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Please answer all required questions: " + missingQuestions);
        }
    }
}