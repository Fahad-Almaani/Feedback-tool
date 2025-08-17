package com.training.feedbacktool.survey;

import com.training.feedbacktool.entity.Survey;
import com.training.feedbacktool.repository.SurveyRepository;
import com.training.feedbacktool.survey.api.dto.CreateSurveyRequest;
import com.training.feedbacktool.survey.api.dto.SurveyResponse;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

        // Map "active" flag to current "status" field
        if (Boolean.TRUE.equals(req.active())) {
            s.setStatus("ACTIVE");
        } else {
            s.setStatus("DRAFT");
        }

        Survey saved = repo.save(s);
        return toDto(saved);
    }

    // ---- NEW: list all surveys (newest first) ----
    @Transactional(readOnly = true)
    public List<SurveyResponse> listAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ---- mapper ----
    private SurveyResponse toDto(Survey s) {
        return new SurveyResponse(
                s.getId(),
                s.getTitle(),
                s.getDescription(),
                s.getStatus(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
