package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswersRepository extends JpaRepository<Answer, Long> {

}
