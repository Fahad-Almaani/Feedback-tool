package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.Answers;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswersRepository extends JpaRepository<Answers, Long> {

}
