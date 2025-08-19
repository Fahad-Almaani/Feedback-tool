package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResponsesRepository extends JpaRepository<Response, Long> {

    // Find responses by survey ID
    @Query("SELECT r FROM Response r WHERE r.survey.id = :surveyId")
    List<Response> findBySurveyId(@Param("surveyId") Long surveyId);

}
