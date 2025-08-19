package com.training.feedbacktool.controller;

import com.training.feedbacktool.dto.SimpleAnswerDTO;
import com.training.feedbacktool.entity.Response;
import com.training.feedbacktool.entity.Answer;
import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.ResponsesRepository;
import com.training.feedbacktool.repository.AnswersRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/responses")
@CrossOrigin(origins = "*")
public class ResponsesController {

    private final ResponsesRepository responsesRepository;
    private final AnswersRepository answersRepository;

    public ResponsesController(ResponsesRepository responsesRepository, AnswersRepository answersRepository) {
        this.responsesRepository = responsesRepository;
        this.answersRepository = answersRepository;
    }

    @GetMapping("/debug")
    public String debugAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return "No authentication found";
        }
        return "Authenticated as: " + auth.getName() + " with authorities: " + auth.getAuthorities();
    }

    @GetMapping("/count")
    public Map<String, Object> getResponseCount() {
        try {
            long count = responsesRepository.count();
            Map<String, Object> result = new HashMap<>();
            result.put("count", count);
            result.put("message", "Total responses in database");
            return result;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    @GetMapping("/survey/{surveyId}")
    public ResponseEntity<?> getResponsesBySurveyId(@PathVariable Long surveyId) {
        try {
            System.out.println("Getting responses for survey ID: " + surveyId);
            List<Answer> answers = answersRepository.findBySurveyId(surveyId);
            System.out.println("Found " + answers.size() + " answers for survey " + surveyId);

            // Group answers by respondent
            Map<String, List<Answer>> answersByRespondent = new HashMap<>();

            for (Answer answer : answers) {
                User user = answer.getUser();
                String respondentKey;
                if (user != null) {
                    respondentKey = user.getEmail(); // Use email as unique identifier for authenticated users
                } else {
                    // For anonymous users, we'll group them by creation time proximity
                    // This is a simple approach - in reality you might use session IDs
                    respondentKey = "anonymous_" + answer.getCreatedAt().toString().substring(0, 19); // Group by minute
                }

                answersByRespondent.computeIfAbsent(respondentKey, k -> new ArrayList<>()).add(answer);
            }

            // Convert to response structure
            List<Map<String, Object>> responses = new ArrayList<>();
            int responseNumber = 1;

            for (Map.Entry<String, List<Answer>> entry : answersByRespondent.entrySet()) {
                List<Answer> respondentAnswers = entry.getValue();

                // Get respondent info from first answer
                Answer firstAnswer = respondentAnswers.get(0);
                User user = firstAnswer.getUser();

                // Create response object
                Map<String, Object> response = new HashMap<>();
                response.put("responseId", responseNumber++);
                response.put("respondentName", user != null ? user.getName() : "Anonymous User");
                response.put("respondentEmail", user != null ? user.getEmail() : null);
                response.put("isAnonymous", user == null);

                // Add user details when not anonymous
                if (user != null) {
                    Map<String, Object> userDetails = new HashMap<>();
                    userDetails.put("id", user.getId());
                    userDetails.put("name", user.getName());
                    userDetails.put("email", user.getEmail());
                    response.put("user", userDetails);
                } else {
                    response.put("user", null);
                }

                response.put("submittedAt", respondentAnswers.stream()
                        .map(Answer::getCreatedAt)
                        .min(java.time.Instant::compareTo)
                        .orElse(firstAnswer.getCreatedAt()));
                response.put("totalAnswers", respondentAnswers.size());

                // Convert answers to DTOs and sort by question order
                List<SimpleAnswerDTO> answerDTOs = respondentAnswers.stream()
                        .map(answer -> new SimpleAnswerDTO(
                                answer.getId(),
                                answer.getAnswerText(),
                                answer.getCreatedAt(),
                                answer.getQuestion().getId(),
                                answer.getQuestion().getQuestionText(),
                                answer.getQuestion().getType(),
                                user != null ? user.getName() : "Anonymous User",
                                user != null ? user.getEmail() : null,
                                user == null))
                        .sorted((a, b) -> a.questionId().compareTo(b.questionId()))
                        .collect(Collectors.toList());

                response.put("answers", answerDTOs);
                responses.add(response);
            }

            // Sort responses by submission time
            responses.sort((r1, r2) -> {
                java.time.Instant time1 = (java.time.Instant) r1.get("submittedAt");
                java.time.Instant time2 = (java.time.Instant) r2.get("submittedAt");
                return time1.compareTo(time2);
            });

            Map<String, Object> result = new HashMap<>();
            result.put("surveyId", surveyId);
            result.put("totalResponses", responses.size());
            result.put("totalAnswers", answers.size());
            result.put("responses", responses);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error getting responses for survey " + surveyId + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("type", e.getClass().getSimpleName());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getAllResponses() {
        try {
            System.out.println("Getting all responses...");
            List<Response> responses = responsesRepository.findAll();
            System.out.println("Found " + responses.size() + " responses");
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.err.println("Error getting responses: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("type", e.getClass().getSimpleName());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/{id}")
    public Optional<Response> getResponseById(@PathVariable Long id) {
        return responsesRepository.findById(id);
    }

    @PostMapping
    public Response createResponse(@RequestBody Response response) {
        return responsesRepository.save(response);
    }

    @DeleteMapping("/{id}")
    public void deleteResponse(@PathVariable Long id) {
        responsesRepository.deleteById(id);
    }
}
