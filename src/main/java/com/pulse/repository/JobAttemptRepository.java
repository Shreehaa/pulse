package com.pulse.repository;

import com.pulse.entity.JobAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobAttemptRepository
        extends JpaRepository<JobAttempt, Long> {

    List<JobAttempt> findByJobIdOrderByAttemptNumberAsc(Long jobId);
}