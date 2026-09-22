package com.pulse.service;

import com.pulse.entity.IdempotencyRecord;
import com.pulse.entity.Job;
import com.pulse.entity.JobStatus;
import com.pulse.exception.IdempotencyConflictException;
import com.pulse.repository.IdempotencyRecordRepository;
import com.pulse.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobEventPublisher jobEventPublisher;
    private final IdempotencyRecordRepository idempotencyRecordRepository;

    public JobService(
            JobRepository jobRepository,
            JobEventPublisher jobEventPublisher,
            IdempotencyRecordRepository idempotencyRecordRepository) {

        this.jobRepository = jobRepository;
        this.jobEventPublisher = jobEventPublisher;
        this.idempotencyRecordRepository =
                idempotencyRecordRepository;
    }

    public Job createJob(
            String name,
            String idempotencyKey) {

        String requestFingerprint =
                createFingerprint(name);

        Optional<IdempotencyRecord> existingRecord =
                idempotencyRecordRepository
                        .findByIdempotencyKey(idempotencyKey);

        if (existingRecord.isPresent()) {

            IdempotencyRecord record =
                    existingRecord.get();

            Long existingJobId =
                    record.getJobId();

            Job existingJob =
                    jobRepository
                            .findById(existingJobId)
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "Job associated with idempotency key was not found"
                                    )
                            );

            if (!existingJob.getName().equals(name)) {

                throw new IdempotencyConflictException(
                        "Idempotency key has already been used for a different request"
                );
            }

            return existingJob;
        }

        Job job =
                new Job(
                        name,
                        JobStatus.PENDING
                );

        Job savedJob =
                jobRepository.save(job);

        IdempotencyRecord idempotencyRecord =
                new IdempotencyRecord(
                        idempotencyKey,
                        requestFingerprint,
                        savedJob.getId()
                );

        idempotencyRecordRepository.save(
                idempotencyRecord
        );

        jobEventPublisher.publishJobCreated(
                savedJob
        );

        return savedJob;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    private String createFingerprint(String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            value.getBytes(StandardCharsets.UTF_8)
                    );

            StringBuilder hexString =
                    new StringBuilder();

            for (byte b : hash) {

                String hex =
                        Integer.toHexString(
                                0xff & b
                        );

                if (hex.length() == 1) {
                    hexString.append('0');
                }

                hexString.append(hex);
            }

            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm is not available",
                    e
            );
        }
    }
}