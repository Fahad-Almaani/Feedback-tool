package com.training.feedbacktool.controller;

import com.training.feedbacktool.entity.Response;
import com.training.feedbacktool.service.ResponseService;
import com.training.feedbacktool.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/responses")
public class ResponsesController {

    private final ResponseService responseService;
    private final EmailService emailService;

    public ResponsesController(ResponseService responseService, EmailService emailService) {
        this.responseService = responseService;
        this.emailService = emailService;
    }

    @GetMapping
    public List<Response> getAllResponses() {
        return responseService.getAllResponses();
    }

    @GetMapping("/{id}")
    public Optional<Response> getResponseById(@PathVariable Long id) {
        return responseService.getResponseById(id);
    }

    @PostMapping
    public Response createResponse(@RequestBody Response response) {
        return responseService.createResponse(response);
    }

    @DeleteMapping("/{id}")
    public void deleteResponse(@PathVariable Long id) {
        responseService.deleteResponse(id);
    }

    // Test endpoint to verify email configuration
    @PostMapping("/test-email")
    public ResponseEntity<String> testEmail() {
        try {
            emailService.sendTestEmail();
            return ResponseEntity.ok("Test email sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }
}
