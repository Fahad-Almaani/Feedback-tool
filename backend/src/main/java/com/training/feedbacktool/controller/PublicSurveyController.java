package com.training.feedbacktool.controller;

import com.training.feedbacktool.dto.PublicSurveyResponse;
import com.training.feedbacktool.dto.SubmitResponseRequest;
import com.training.feedbacktool.service.ResponseService;
import com.training.feedbacktool.service.SurveyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/surveys")
@CrossOrigin(origins = "*")
public class PublicSurveyController {

    private final SurveyService surveyService;
    private final ResponseService responseService;

    public PublicSurveyController(SurveyService surveyService, ResponseService responseService) {
        this.surveyService = surveyService;
        this.responseService = responseService;
    }

    // GET /public/surveys/{id} -> respondents fetch survey + questions
    @GetMapping("/{id}")
    public ResponseEntity<PublicSurveyResponse> getSurvey(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.findByIdWithQuestions(id));
    }

    // POST /public/surveys/{id}/responses -> respondents submit answers
    @PostMapping("/{id}/responses")
    public ResponseEntity<String> submitResponses(
            @PathVariable Long id,
            @Valid @RequestBody SubmitResponseRequest request,
            HttpServletRequest httpRequest) {

        try {
            String authHeader = httpRequest.getHeader("Authorization");
            responseService.submitSurveyResponse(id, request, authHeader);
            return ResponseEntity.ok("Survey response submitted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while submitting the response");
        }
    }
}
