package com.training.feedbacktool.service;

import com.training.feedbacktool.entity.Response;
import com.training.feedbacktool.entity.Survey;
import com.training.feedbacktool.entity.User;
import com.training.feedbacktool.repository.ResponsesRepository;
import com.training.feedbacktool.repository.SurveyRepository;
import com.training.feedbacktool.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class ResponseService {

    private static final Logger logger = LoggerFactory.getLogger(ResponseService.class);

    private final ResponsesRepository responsesRepository;
    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ResponseService(
            ResponsesRepository responsesRepository,
            SurveyRepository surveyRepository,
            UserRepository userRepository,
            EmailService emailService
    ) {
        this.responsesRepository = responsesRepository;
        this.surveyRepository = surveyRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Response createResponse(Response response) {
        Response savedResponse = responsesRepository.save(response);
        logger.info("Response saved with ID: {}", savedResponse.getId());

        sendEmailIfPossible(savedResponse);

        return savedResponse;
    }

    @Transactional
    public Response updateResponse(Long id, Response updatedResponse) {
        return responsesRepository.findById(id).map(existingResponse -> {

            // Update the fields you want
            existingResponse.setAnswers(updatedResponse.getAnswers());
            existingResponse.setSurvey(updatedResponse.getSurvey());
            existingResponse.setUser(updatedResponse.getUser());

            Response savedResponse = responsesRepository.save(existingResponse);
            logger.info("Response updated with ID: {}", savedResponse.getId());

            sendEmailIfPossible(savedResponse);

            return savedResponse;
        }).orElseThrow(() -> new RuntimeException("Response not found with ID: " + id));
    }

    private void sendEmailIfPossible(Response response) {
        Survey survey = response.getSurvey();
        User user = response.getUser();
        if (survey != null && user != null) {
            try {
                emailService.sendNewResponseNotification(
                        survey.getTitle(),
                        user.getName(),
                        user.getEmail(),
                        response.getId()
                );
            } catch (Exception e) {
                logger.error("Failed to send email notification for response ID: {}", response.getId(), e);
            }
        }
    }

    public List<Response> getAllResponses() {
        return responsesRepository.findAll();
    }

    public Optional<Response> getResponseById(Long id) {
        return responsesRepository.findById(id);
    }

    public void deleteResponse(Long id) {
        responsesRepository.deleteById(id);
        logger.info("Response deleted with ID: {}", id);
    }
}
