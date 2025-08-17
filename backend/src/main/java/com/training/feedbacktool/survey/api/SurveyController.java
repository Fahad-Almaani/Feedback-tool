package com.training.feedbacktool.survey.api;

import com.training.feedbacktool.survey.SurveyService;
import com.training.feedbacktool.survey.api.dto.CreateSurveyRequest;
import com.training.feedbacktool.survey.api.dto.SurveyResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
}
