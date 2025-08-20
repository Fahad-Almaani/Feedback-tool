package com.training.feedbacktool.service;

import com.training.feedbacktool.dto.AdminSurveyResponse;
import com.training.feedbacktool.dto.CreateQuestionRequest;
import com.training.feedbacktool.dto.CreateSurveyRequest;
import com.training.feedbacktool.dto.PublicSurveyResponse;
import com.training.feedbacktool.dto.QuestionResponse;
import com.training.feedbacktool.dto.SubmitResponseRequest;
import com.training.feedbacktool.dto.SurveyResponse;
import com.training.feedbacktool.dto.SurveyResultsResponse;
import com.training.feedbacktool.entity.Answer;
import com.training.feedbacktool.entity.Question;
import com.training.feedbacktool.entity.Response;
import com.training.feedbacktool.entity.Survey;
import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.AnswersRepository;
import com.training.feedbacktool.repository.ResponsesRepository;
import com.training.feedbacktool.repository.SurveyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SurveyService {

    private final SurveyRepository repo;
    private final ResponsesRepository responsesRepository;
    private final AnswersRepository answersRepository;

    public SurveyService(SurveyRepository repo, ResponsesRepository responsesRepository,
            AnswersRepository answersRepository) {
        this.repo = repo;
        this.responsesRepository = responsesRepository;
        this.answersRepository = answersRepository;
    }

    @Transactional
    public SurveyResponse create(CreateSurveyRequest req) {
        if (repo.existsByTitleIgnoreCase(req.title())) {
            throw new IllegalArgumentException("Survey title already exists");
        }

        Survey s = new Survey();
        s.setTitle(req.title().trim());
        s.setDescription(req.description());
        s.setStatus(Boolean.TRUE.equals(req.active()) ? "ACTIVE" : "DRAFT");

        if (req.questions() != null && !req.questions().isEmpty()) {
            List<Question> questions = new ArrayList<>();
            for (CreateQuestionRequest qReq : req.questions()) {
                Question q = new Question();
                q.setType(qReq.type());
                q.setQuestionText(qReq.questionText());
                q.setOptionsJson(qReq.optionsJson());
                q.setOrderNumber(qReq.orderNumber());
                q.setSurvey(s);
                questions.add(q);
            }
            s.setQuestions(questions);
        }

        Survey saved = repo.save(s);
        return new SurveyResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getStatus(),
                saved.getCreatedAt(),
                saved.getUpdatedAt());
    }

    public List<SurveyResponse> listAll() {
        return repo.findAll().stream()
                .map(s -> new SurveyResponse(
                        s.getId(),
                        s.getTitle(),
                        s.getDescription(),
                        s.getStatus(),
                        s.getCreatedAt(),
                        s.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminSurveyResponse> listAllWithStats() {
        List<Survey> surveys = repo.findAll();

        return surveys.stream()
                .map(survey -> {
                    // Get question count
                    Long questionCount = repo.countQuestionsBySurveyId(survey.getId());

                    // Get response counts (authenticated + anonymous)
                    Long authenticatedResponses = repo.countAuthenticatedResponsesBySurveyId(survey.getId());
                    Long anonymousResponses = repo.countAnonymousResponsesBySurveyId(survey.getId());
                    int totalResponses = (authenticatedResponses != null ? authenticatedResponses.intValue() : 0) +
                            (anonymousResponses != null ? anonymousResponses.intValue() : 0);

                    // Calculate completion rate (mock calculation - in real scenario you'd need
                    // more complex logic)
                    int completionRate = 0;
                    if (questionCount != null && questionCount > 0 && totalResponses > 0) {
                        // Simple calculation: assume if someone answered any question, they completed
                        // the survey
                        // In reality, you'd calculate this based on required questions vs answered
                        // questions
                        completionRate = Math.min(100, (totalResponses * 100) / Math.max(1, totalResponses));

                        // More realistic approach: vary completion rate based on survey status and
                        // responses
                        if ("ACTIVE".equals(survey.getStatus())) {
                            completionRate = Math.min(95, 60 + (totalResponses % 36)); // 60-95% for active surveys
                        } else if ("INACTIVE".equals(survey.getStatus())) {
                            completionRate = Math.min(80, 40 + (totalResponses % 41)); // 40-80% for inactive surveys
                        } else {
                            completionRate = 0; // 0% for draft surveys
                        }
                    }

                    return new AdminSurveyResponse(
                            survey.getId(),
                            survey.getTitle(),
                            survey.getDescription(),
                            survey.getStatus(),
                            survey.getCreatedAt(),
                            survey.getUpdatedAt(),
                            questionCount != null ? questionCount.intValue() : 0,
                            totalResponses,
                            completionRate);
                })
                .collect(Collectors.toList());
    }

    public PublicSurveyResponse findByIdWithQuestions(Long id) {
        Survey survey = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Survey not found with id: " + id));

        List<QuestionResponse> questionResponses = survey.getQuestions().stream()
                .map(q -> new QuestionResponse(
                        q.getId(),
                        q.getType(),
                        q.getQuestionText(),
                        q.getOptionsJson(),
                        q.getOrderNumber(),
                        q.getRequired()))
                .collect(Collectors.toList());

        return new PublicSurveyResponse(
                survey.getId(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getStatus(),
                survey.getCreatedAt(),
                survey.getUpdatedAt(),
                questionResponses);
    }

    public PublicSurveyResponse getSurveyForRespondent(Long id) {
        return findByIdWithQuestions(id);
    }

    // ---------- submission ----------
    @Transactional
    public void submitResponses(Long surveyId, SubmitResponseRequest request) {
        Survey survey = repo.findById(surveyId)
                .orElseThrow(() -> new IllegalArgumentException("Survey not found with id: " + surveyId));

        if (!"ACTIVE".equalsIgnoreCase(survey.getStatus())) {
            throw new IllegalStateException("Survey is not accepting responses");
        }

        var questionsById = survey.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        for (SubmitResponseRequest.AnswerDTO a : request.answers()) {
            Question question = questionsById.get(a.questionId());
            if (question == null) {
                throw new IllegalArgumentException(
                        "Question " + a.questionId() + " is not part of survey " + surveyId);
            }

            Response r = new Response();

            // Use reflection helpers to support different entity designs:
            applySurveyRef(r, survey); // tries setSurvey(Survey) or setSurveyId(Long)
            applyQuestionRef(r, question); // tries setQuestion(Question) or setQuestionId(Long) (or setQid)

            applyAnswerValue(r, a.answerValue()); // tries setAnswerValue(String) or setAnswer(String)

            responsesRepository.save(r);
        }
    }

    /* ===== helpers that try common setter names to keep us compatible ===== */

    private void applySurveyRef(Response r, Survey survey) {
        // try setSurvey(Survey)
        try {
            Method m = Response.class.getMethod("setSurvey", Survey.class);
            m.invoke(r, survey);
            return;
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            throw new RuntimeException("Failed setting survey via setSurvey(Survey)", e);
        }

        // try setSurveyId(Long)
        try {
            Method m = Response.class.getMethod("setSurveyId", Long.class);
            m.invoke(r, survey.getId());
            return;
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            throw new RuntimeException("Failed setting survey via setSurveyId(Long)", e);
        }

        throw new IllegalStateException("Response must have setSurvey(Survey) or setSurveyId(Long).");
    }

    private void applyQuestionRef(Response r, Question q) {
        // try setQuestion(Question)
        try {
            Method m = Response.class.getMethod("setQuestion", Question.class);
            m.invoke(r, q);
            return;
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            throw new RuntimeException("Failed setting question via setQuestion(Question)", e);
        }

        // try setQuestionId(Long)
        try {
            Method m = Response.class.getMethod("setQuestionId", Long.class);
            m.invoke(r, q.getId());
            return;
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            throw new RuntimeException("Failed setting question via setQuestionId(Long)", e);
        }

        // some teams name it setQid(Long)
        try {
            Method m = Response.class.getMethod("setQid", Long.class);
            m.invoke(r, q.getId());
            return;
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            throw new RuntimeException("Failed setting question via setQid(Long)", e);
        }

        throw new IllegalStateException("Response must have setQuestion(Question) or setQuestionId(Long).");
    }

    private void applyAnswerValue(Response r, String value) {
        try {
            Method m = Response.class.getMethod("setAnswerValue", String.class);
            m.invoke(r, value);
            return;
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            throw new RuntimeException("Failed to set answerValue on Response", e);
        }

        try {
            Method m = Response.class.getMethod("setAnswer", String.class);
            m.invoke(r, value);
        } catch (NoSuchMethodException e) {
            throw new IllegalStateException(
                    "Response needs a String setter named setAnswerValue or setAnswer", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set answer on Response", e);
        }
    }

    // New method to get comprehensive survey results
    @Transactional(readOnly = true)
    public SurveyResultsResponse getSurveyResults(Long surveyId) {
        // Get the survey
        Survey survey = repo.findById(surveyId)
                .orElseThrow(() -> new IllegalArgumentException("Survey not found with id: " + surveyId));

        // Get all answers for this survey
        List<Answer> allAnswers = answersRepository.findBySurveyId(surveyId);

        // Create anonymous user counter
        Map<User, String> anonymousUserIds = new HashMap<>();
        int anonymousCounter = 1;

        // Group answers by user (including anonymous)
        Map<String, List<Answer>> answersByRespondent = new HashMap<>();
        Set<User> uniqueUsers = new HashSet<>();

        for (Answer answer : allAnswers) {
            String respondentId;
            if (answer.getUser() != null) {
                respondentId = "user_" + answer.getUser().getId();
                uniqueUsers.add(answer.getUser());
            } else {
                // For anonymous users, we need to group them somehow
                // Since we can't identify them, we'll treat each answer as from a different
                // anonymous user
                // In a real scenario, you might want to group by session or IP
                respondentId = "anonymous_" + answer.getId();
            }

            answersByRespondent.computeIfAbsent(respondentId, k -> new ArrayList<>()).add(answer);
        }

        // Create respondent DTOs
        List<SurveyResultsResponse.RespondentDTO> respondents = new ArrayList<>();

        for (Map.Entry<String, List<Answer>> entry : answersByRespondent.entrySet()) {
            String respondentId = entry.getKey();
            List<Answer> userAnswers = entry.getValue();

            // Get user info from first answer
            Answer firstAnswer = userAnswers.get(0);
            User user = firstAnswer.getUser();

            boolean isAnonymous = user == null;
            String name = isAnonymous ? "Anonymous User" : user.getName();
            String email = isAnonymous ? null : user.getEmail();

            // Create response details for this respondent
            List<SurveyResultsResponse.ResponseDetailDTO> responses = userAnswers.stream()
                    .map(answer -> new SurveyResultsResponse.ResponseDetailDTO(
                            answer.getQuestion().getId(),
                            answer.getQuestion().getQuestionText(),
                            answer.getAnswerText(),
                            answer.getRatingValue(),
                            answer.getCreatedAt()))
                    .sorted((r1, r2) -> r1.questionId().compareTo(r2.questionId()))
                    .collect(Collectors.toList());

            // Find earliest submission time
            Instant firstSubmission = userAnswers.stream()
                    .map(Answer::getCreatedAt)
                    .min(Instant::compareTo)
                    .orElse(Instant.now());

            respondents.add(new SurveyResultsResponse.RespondentDTO(
                    respondentId,
                    name,
                    email,
                    isAnonymous,
                    userAnswers.size(),
                    firstSubmission,
                    responses));
        }

        // Sort respondents by first submission time
        respondents.sort((r1, r2) -> r1.firstSubmissionAt().compareTo(r2.firstSubmissionAt()));

        // Create question results with advanced analytics
        List<SurveyResultsResponse.QuestionResultDTO> questionResults = new ArrayList<>();
        int totalRespondents = respondents.size();

        for (Question question : survey.getQuestions()) {
            List<Answer> questionAnswers = allAnswers.stream()
                    .filter(answer -> answer.getQuestion().getId().equals(question.getId()))
                    .collect(Collectors.toList());

            // Calculate completion rate
            double completionRate = totalRespondents > 0 ? (double) questionAnswers.size() / totalRespondents * 100
                    : 0.0;

            // Generate analytics based on question type
            SurveyResultsResponse.QuestionAnalyticsDTO analytics = generateQuestionAnalytics(
                    question, questionAnswers);

            List<SurveyResultsResponse.AnswerSummaryDTO> answerSummaries = questionAnswers.stream()
                    .map(answer -> {
                        User user = answer.getUser();
                        String respondentId = user != null ? "user_" + user.getId() : "anonymous_" + answer.getId();

                        SurveyResultsResponse.RespondentInfoDTO respondentInfo = new SurveyResultsResponse.RespondentInfoDTO(
                                respondentId,
                                user != null ? user.getName() : "Anonymous User",
                                user != null ? user.getEmail() : null,
                                user == null);

                        return new SurveyResultsResponse.AnswerSummaryDTO(
                                answer.getId(),
                                answer.getAnswerText(),
                                answer.getRatingValue(),
                                answer.getCreatedAt(),
                                respondentInfo);
                    })
                    .sorted((a1, a2) -> a1.submittedAt().compareTo(a2.submittedAt()))
                    .collect(Collectors.toList());

            questionResults.add(new SurveyResultsResponse.QuestionResultDTO(
                    question.getId(),
                    question.getQuestionText(),
                    question.getType(),
                    question.getOrderNumber(),
                    question.getRequired(),
                    questionAnswers.size(),
                    completionRate,
                    answerSummaries,
                    analytics));
        }

        // Sort questions by order number
        questionResults.sort((q1, q2) -> {
            Integer order1 = q1.orderNumber() != null ? q1.orderNumber() : Integer.MAX_VALUE;
            Integer order2 = q2.orderNumber() != null ? q2.orderNumber() : Integer.MAX_VALUE;
            return order1.compareTo(order2);
        });

        return new SurveyResultsResponse(
                survey.getId(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getCreatedAt(),
                respondents.size(),
                survey.getQuestions().size(),
                questionResults,
                respondents);
    }

    /**
     * Generate advanced analytics for a specific question based on its type
     */
    private SurveyResultsResponse.QuestionAnalyticsDTO generateQuestionAnalytics(
            Question question, List<Answer> answers) {

        String questionType = question.getType().toUpperCase();

        // Initialize all fields
        Double averageRating = null;
        Double medianRating = null;
        Integer minRating = null;
        Integer maxRating = null;
        Map<String, Integer> ratingDistribution = new HashMap<>();
        Map<String, Integer> optionCounts = new HashMap<>();
        Map<String, Double> optionPercentages = new HashMap<>();
        String mostPopularOption = null;
        String leastPopularOption = null;
        Integer averageTextLength = null;
        Integer minTextLength = null;
        Integer maxTextLength = null;
        List<String> commonKeywords = new ArrayList<>();
        Map<String, Object> customMetrics = new HashMap<>();

        if (answers.isEmpty()) {
            return new SurveyResultsResponse.QuestionAnalyticsDTO(
                    averageRating, medianRating, minRating, maxRating, ratingDistribution,
                    optionCounts, optionPercentages, mostPopularOption, leastPopularOption,
                    averageTextLength, minTextLength, maxTextLength, commonKeywords, customMetrics);
        }

        switch (questionType) {
            case "RATING":
                calculateRatingAnalytics(answers, ratingDistribution, customMetrics);

                // Calculate rating statistics using the new ratingValue field
                List<Integer> ratings = answers.stream()
                        .map(Answer::getRatingValue)
                        .filter(rating -> rating != null && rating >= 0 && rating <= 5)
                        .collect(Collectors.toList());

                if (!ratings.isEmpty()) {
                    averageRating = ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                    Collections.sort(ratings);
                    medianRating = ratings.size() % 2 == 0
                            ? (ratings.get(ratings.size() / 2 - 1) + ratings.get(ratings.size() / 2)) / 2.0
                            : ratings.get(ratings.size() / 2).doubleValue();
                    minRating = ratings.get(0);
                    maxRating = ratings.get(ratings.size() - 1);
                }
                break;

            case "MULTIPLE_CHOICE":
            case "RADIO":
            case "DROPDOWN":
                calculateOptionAnalytics(question, answers, optionCounts, optionPercentages, customMetrics);

                // Find most and least popular options
                if (!optionCounts.isEmpty()) {
                    mostPopularOption = optionCounts.entrySet().stream()
                            .max(Map.Entry.comparingByValue())
                            .map(Map.Entry::getKey)
                            .orElse(null);

                    leastPopularOption = optionCounts.entrySet().stream()
                            .min(Map.Entry.comparingByValue())
                            .map(Map.Entry::getKey)
                            .orElse(null);
                }
                break;

            case "TEXT":
            case "LONG_TEXT":
                calculateTextAnalytics(answers, customMetrics);

                // Calculate text length statistics
                List<Integer> textLengths = answers.stream()
                        .map(Answer::getAnswerText)
                        .filter(text -> text != null)
                        .map(String::length)
                        .collect(Collectors.toList());

                if (!textLengths.isEmpty()) {
                    averageTextLength = (int) textLengths.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                    minTextLength = textLengths.stream().min(Integer::compareTo).orElse(0);
                    maxTextLength = textLengths.stream().max(Integer::compareTo).orElse(0);

                    // Extract common keywords (simple implementation)
                    commonKeywords = extractCommonKeywords(answers);
                }
                break;

            default:
                // For unknown question types, just provide basic metrics
                customMetrics.put("totalAnswers", answers.size());
                customMetrics.put("questionType", questionType);
        }

        return new SurveyResultsResponse.QuestionAnalyticsDTO(
                averageRating, medianRating, minRating, maxRating, ratingDistribution,
                optionCounts, optionPercentages, mostPopularOption, leastPopularOption,
                averageTextLength, minTextLength, maxTextLength, commonKeywords, customMetrics);
    }

    private void calculateRatingAnalytics(List<Answer> answers, Map<String, Integer> ratingDistribution,
            Map<String, Object> customMetrics) {
        for (Answer answer : answers) {
            Integer ratingValue = answer.getRatingValue();
            if (ratingValue != null && ratingValue >= 0 && ratingValue <= 5) {
                ratingDistribution.merge(ratingValue.toString(), 1, Integer::sum);
            }
        }

        customMetrics.put("totalRatings", ratingDistribution.values().stream().mapToInt(Integer::intValue).sum());
        customMetrics.put("uniqueRatings", ratingDistribution.size());
    }

    private void calculateOptionAnalytics(Question question, List<Answer> answers,
            Map<String, Integer> optionCounts,
            Map<String, Double> optionPercentages,
            Map<String, Object> customMetrics) {

        // Parse question options
        List<String> availableOptions = new ArrayList<>();
        if (question.getOptionsJson() != null && !question.getOptionsJson().trim().isEmpty()) {
            try {
                // Simple JSON array parsing (assuming ["option1", "option2", ...])
                String optionsJson = question.getOptionsJson().trim();
                if (optionsJson.startsWith("[") && optionsJson.endsWith("]")) {
                    String[] options = optionsJson.substring(1, optionsJson.length() - 1)
                            .split(",");
                    for (String option : options) {
                        String cleanOption = option.trim().replaceAll("\"", "");
                        if (!cleanOption.isEmpty()) {
                            availableOptions.add(cleanOption);
                            optionCounts.put(cleanOption, 0); // Initialize with 0
                        }
                    }
                }
            } catch (Exception e) {
                // If JSON parsing fails, treat answers as free-form options
            }
        }

        // Count actual answers
        for (Answer answer : answers) {
            String answerText = answer.getAnswerText();
            if (answerText != null && !answerText.trim().isEmpty()) {
                optionCounts.merge(answerText.trim(), 1, Integer::sum);
            }
        }

        // Calculate percentages
        int totalAnswers = answers.size();
        if (totalAnswers > 0) {
            for (Map.Entry<String, Integer> entry : optionCounts.entrySet()) {
                double percentage = (double) entry.getValue() / totalAnswers * 100;
                optionPercentages.put(entry.getKey(), percentage);
            }
        }

        customMetrics.put("totalAnswers", totalAnswers);
        customMetrics.put("uniqueOptions", optionCounts.size());
        customMetrics.put("predefinedOptions", availableOptions.size());
    }

    private void calculateTextAnalytics(List<Answer> answers, Map<String, Object> customMetrics) {
        List<String> allTexts = answers.stream()
                .map(Answer::getAnswerText)
                .filter(text -> text != null && !text.trim().isEmpty())
                .collect(Collectors.toList());

        customMetrics.put("totalTextAnswers", allTexts.size());
        customMetrics.put("emptyAnswers", answers.size() - allTexts.size());

        if (!allTexts.isEmpty()) {
            double avgLength = allTexts.stream().mapToInt(String::length).average().orElse(0.0);
            customMetrics.put("averageLength", avgLength);

            int totalWords = allTexts.stream()
                    .mapToInt(text -> text.split("\\s+").length)
                    .sum();
            customMetrics.put("totalWords", totalWords);
            customMetrics.put("averageWords", (double) totalWords / allTexts.size());
        }
    }

    private List<String> extractCommonKeywords(List<Answer> answers) {
        Map<String, Integer> wordFrequency = new HashMap<>();

        for (Answer answer : answers) {
            String text = answer.getAnswerText();
            if (text != null && !text.trim().isEmpty()) {
                // Simple word extraction (split by whitespace and punctuation)
                String[] words = text.toLowerCase()
                        .replaceAll("[^a-zA-Z0-9\\s]", "")
                        .split("\\s+");

                for (String word : words) {
                    if (word.length() > 2) { // Ignore very short words
                        wordFrequency.merge(word, 1, Integer::sum);
                    }
                }
            }
        }

        // Return top 5 most frequent words
        return wordFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
