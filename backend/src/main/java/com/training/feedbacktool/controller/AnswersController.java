package com.training.feedbacktool.controller;

import com.training.feedbacktool.entity.Answer;
import com.training.feedbacktool.repository.AnswersRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers") // Base URL for this controller
@CrossOrigin(origins = "*")
public class AnswersController {

    private final AnswersRepository repository;

    // Constructor injection
    public AnswersController(AnswersRepository repository) {
        this.repository = repository;
    }

    // GET /api/answers → Get all answers
    @GetMapping
    public List<Answer> getAllAnswers() {
        return repository.findAll();
    }

    // POST /api/answers → Create a new answer
    @PostMapping
    public Answer createAnswer(@RequestBody Answer answer) {
        return repository.save(answer);
    }
}
