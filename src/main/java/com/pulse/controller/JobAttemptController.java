package com.pulse.controller;

import com.pulse.entity.JobAttempt;
import com.pulse.service.JobAttemptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobAttemptController {

    private final JobAttemptService jobAttemptService;

    public JobAttemptController(JobAttemptService jobAttemptService) {
        this.jobAttemptService = jobAttemptService;
    }

    @GetMapping("/{jobId}/attempts")
    public ResponseEntity<List<JobAttempt>> getJobAttempts(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(
                jobAttemptService.getAttemptsForJob(jobId)
        );
    }
}