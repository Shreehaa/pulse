package com.pulse.service;

import com.pulse.entity.Job;
import com.pulse.entity.JobStatus;
import com.pulse.entity.JobStatusHistory;
import com.pulse.repository.JobStatusHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class JobStatusHistoryService {

    private final JobStatusHistoryRepository repository;

    public JobStatusHistoryService(
            JobStatusHistoryRepository repository) {

        this.repository = repository;
    }

    public void record(
            Job job,
            JobStatus status) {

        JobStatusHistory history =
                new JobStatusHistory(
                        job,
                        status,
                        Instant.now()
                );

        repository.save(history);
    }

    public List<JobStatusHistory> getHistory(
            Long jobId) {

        return repository
                .findByJobIdOrderByChangedAtAsc(jobId);
    }
}