package com.training.feedbacktool.controller;

import com.training.feedbacktool.entity.Response;
import com.training.feedbacktool.repository.ResponsesRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/responses")
public class ResponsesController {

    private final ResponsesRepository responsesRepository;

    public ResponsesController(ResponsesRepository responsesRepository) {
        this.responsesRepository = responsesRepository;
    }

    @GetMapping
    public List<Response> getAllResponses() {
        return responsesRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Response> getResponseById(@PathVariable Long id) {
        return responsesRepository.findById(id);
    }

    @PostMapping
    public Response createResponse(@RequestBody Response response) {
        return responsesRepository.save(response);
    }

    @DeleteMapping("/{id}")
    public void deleteResponse(@PathVariable Long id) {
        responsesRepository.deleteById(id);
    }
}
