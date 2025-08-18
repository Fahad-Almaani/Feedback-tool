package com.training.feedbacktool.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LogoutController {

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
  
        return ResponseEntity.ok("Logged out successfully. Please remove the token from client.");
    }
}
