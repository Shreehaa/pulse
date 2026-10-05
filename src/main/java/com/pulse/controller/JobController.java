package com.pulse.controller;

import com.pulse.dto.CreateJobRequest;
import com.pulse.entity.Job;
import com.pulse.entity.JobStatusHistory;
import com.pulse.service.JobService;
import com.pulse.service.JobStatusHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.nio.file.Path;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final JobStatusHistoryService jobStatusHistoryService;

    public JobController(
            JobService jobService,
            JobStatusHistoryService jobStatusHistoryService) {

        this.jobService = jobService;
        this.jobStatusHistoryService =
                jobStatusHistoryService;
    }

    @PostMapping
    public ResponseEntity<Job> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {

        return ResponseEntity.ok(
                jobService.createJob(
                        request.getName(),
                        idempotencyKey
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {

        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                jobService.getJobById(id)
        );
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<JobStatusHistory>> getJobHistory(
            @PathVariable Long id) {

        // Make sure the job actually exists.
        jobService.getJobById(id);

        return ResponseEntity.ok(
                jobStatusHistoryService.getHistory(id)
        );
    }

    @GetMapping("/{id}/result")
    public ResponseEntity<Resource> downloadResult(
            @PathVariable Long id) {

        Job job = jobService.getJobById(id);

        if (job.getResultPath() == null ||
                job.getResultPath().isBlank()) {

            return ResponseEntity.notFound().build();
        }

        try {
            Path resultPath = Path.of(job.getResultPath());

            if (!java.nio.file.Files.exists(resultPath) ||
                    !java.nio.file.Files.isRegularFile(resultPath)) {

                return ResponseEntity.notFound().build();
            }

            Resource resource =
                    new UrlResource(resultPath.toUri());

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType("text/csv")
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" +
                                    resultPath.getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            return ResponseEntity.internalServerError().build();
        }
    }
}