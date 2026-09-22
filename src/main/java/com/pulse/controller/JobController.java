package com.pulse.controller;

import com.pulse.dto.CreateJobRequest;
import com.pulse.entity.Job;
import com.pulse.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<Job> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @RequestHeader(
                    value = "Idempotency-Key",
                    required = true
            ) String idempotencyKey
    ){

        Job job =
                jobService.createJob(
                        request.getName(),
                        idempotencyKey
                );

        return ResponseEntity.ok(job);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }
}