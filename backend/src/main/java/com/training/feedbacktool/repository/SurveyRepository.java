package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyRepository extends JpaRepository<Survey, Long> {
    boolean existsByTitleIgnoreCase(String title);
}