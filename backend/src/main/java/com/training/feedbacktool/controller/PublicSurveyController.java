package com.training.feedbacktool.controller;

import com.training.feedbacktool.dto.PublicSurveyResponse;
import com.training.feedbacktool.dto.SubmitResponseRequest;
import com.training.feedbacktool.service.SurveyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/surveys")
public class PublicSurveyController {

    private final SurveyService surveyService;

    public PublicSurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    // GET /public/surveys/{id}  -> respondents fetch survey + questions
    @GetMapping("/{id}")
    public ResponseEntity<PublicSurveyResponse> getSurvey(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.findByIdWithQuestions(id));
    }

    // POST /public/surveys/{id}/responses -> respondents submit answers
    @PostMapping("/{id}/responses")
    public ResponseEntity<Void> submitResponses(
            @PathVariable Long id,
            @Valid @RequestBody SubmitResponseRequest request) {

        surveyService.submitResponses(id, request);
        return ResponseEntity.ok().build();
    }
}
