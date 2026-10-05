package com.pulse.service;

import com.pulse.entity.JobAttempt;
import com.pulse.repository.JobAttemptRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobAttemptService {

    private final JobAttemptRepository jobAttemptRepository;

    public JobAttemptService(
            JobAttemptRepository jobAttemptRepository) {

        this.jobAttemptRepository = jobAttemptRepository;
    }

    public List<JobAttempt> getAttemptsForJob(Long jobId) {

        return jobAttemptRepository
                .findByJobIdOrderByAttemptNumberAsc(jobId);
    }
}