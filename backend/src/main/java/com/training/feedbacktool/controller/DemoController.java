package com.training.feedbacktool.controller;

import com.training.feedbacktool.dto.DemoRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demo")
public class DemoController {
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody DemoRequest req) {
        return ResponseEntity.ok().build();
    }
}
