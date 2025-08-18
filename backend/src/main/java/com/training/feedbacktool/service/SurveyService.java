package com.training.feedbacktool.service;

import com.training.feedbacktool.entity.Survey;
import com.training.feedbacktool.repository.SurveyRepository;
import com.training.feedbacktool.dto.CreateSurveyRequest;
import com.training.feedbacktool.dto.SurveyResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SurveyService {

    private final SurveyRepository repo;

    public SurveyService(SurveyRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public SurveyResponse create(CreateSurveyRequest req) {
        // Unique title
        if (repo.existsByTitleIgnoreCase(req.title())) {
            throw new IllegalArgumentException("Survey title already exists");
        }

        // Build entity from request
        Survey s = new Survey();
        s.setTitle(req.title().trim());
        s.setDescription(req.description());

        // Map "active" (if provided) to your current "status" field
        // default remains "DRAFT" as defined in the entity
        if (Boolean.TRUE.equals(req.active())) {
            s.setStatus("ACTIVE");
        } else {
            // if active == null or false, keep DRAFT (or set explicitly)
            s.setStatus("DRAFT");
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

    public java.util.List<SurveyResponse> listAll() {
        return repo.findAll().stream()
                .map(survey -> new SurveyResponse(
                        survey.getId(),
                        survey.getTitle(),
                        survey.getDescription(),
                        survey.getStatus(),
                        survey.getCreatedAt(),
                        survey.getUpdatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }
}
