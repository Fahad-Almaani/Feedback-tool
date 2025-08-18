package com.training.feedbacktool.repository;

import com.training.feedbacktool.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponsesRepository extends JpaRepository<Response, Long> {

}
