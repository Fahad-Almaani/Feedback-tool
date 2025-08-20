package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnswersRepository extends JpaRepository<Answer, Long> {

    // Find answers by survey ID
    @Query("SELECT a FROM Answer a WHERE a.question.survey.id = :surveyId")
    List<Answer> findBySurveyId(@Param("surveyId") Long surveyId);

    // Find answers by question ID
    @Query("SELECT a FROM Answer a WHERE a.question.id = :questionId")
    List<Answer> findByQuestionId(@Param("questionId") Long questionId);

    // Delete answers by survey ID
    @Modifying
    @Query("DELETE FROM Answer a WHERE a.question.survey.id = :surveyId")
    void deleteBySurveyId(@Param("surveyId") Long surveyId);

}
