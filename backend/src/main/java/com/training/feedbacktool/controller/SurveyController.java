package com.training.feedbacktool.controller;

import com.training.feedbacktool.service.SurveyService;
import com.training.feedbacktool.dto.CreateSurveyRequest;
import com.training.feedbacktool.dto.SurveyResponse;
import com.training.feedbacktool.dto.PublicSurveyResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/surveys")
public class SurveyController {

    private final SurveyService service;

    public SurveyController(SurveyService service) {
        this.service = service;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')") // Admin only
    public ResponseEntity<SurveyResponse> create(@Valid @RequestBody CreateSurveyRequest req) {
        SurveyResponse created = service.create(req);
        return ResponseEntity.created(URI.create("/surveys/" + created.id())).body(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Admin only
    public List<SurveyResponse> listAll() {
        return service.listAll();
    }

    @GetMapping("/{id}/public")
    // No authentication required for public survey access
    public ResponseEntity<PublicSurveyResponse> getPublicSurvey(@PathVariable Long id) {
        PublicSurveyResponse survey = service.findByIdWithQuestions(id);
        return ResponseEntity.ok(survey);
    }
}
