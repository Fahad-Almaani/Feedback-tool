package com.training.feedbacktool.service;

import com.training.feedbacktool.dto.CreateQuestionRequest;
import com.training.feedbacktool.dto.CreateSurveyRequest;
import com.training.feedbacktool.dto.PublicSurveyResponse;
import com.training.feedbacktool.dto.QuestionResponse;
import com.training.feedbacktool.dto.SubmitResponseRequest;
import com.training.feedbacktool.dto.SurveyResponse;
import com.training.feedbacktool.entity.Question;
import com.training.feedbacktool.entity.Response;
import com.training.feedbacktool.entity.Survey;
import com.training.feedbacktool.repository.ResponsesRepository;
import com.training.feedbacktool.repository.SurveyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SurveyService {

    private final SurveyRepository repo;
    private final ResponsesRepository responsesRepository;

    public SurveyService(SurveyRepository repo, ResponsesRepository responsesRepository) {
        this.repo = repo;
        this.responsesRepository = responsesRepository;
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
                saved.getUpdatedAt()
        );
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

    public PublicSurveyResponse findByIdWithQuestions(Long id) {
        Survey survey = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Survey not found with id: " + id));

        List<QuestionResponse> questionResponses = survey.getQuestions().stream()
                .map(q -> new QuestionResponse(
                        q.getId(),
                        q.getType(),
                        q.getQuestionText(),
                        q.getOptionsJson(),
                        q.getOrderNumber()))
                .collect(Collectors.toList());

        return new PublicSurveyResponse(
                survey.getId(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getStatus(),
                survey.getCreatedAt(),
                survey.getUpdatedAt(),
                questionResponses
        );
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
            applySurveyRef(r, survey);     // tries setSurvey(Survey) or setSurveyId(Long)
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
}
