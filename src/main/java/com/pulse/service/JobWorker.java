package com.pulse.service;

import com.pulse.config.RedisStreamConfig;
import com.pulse.entity.Job;
import com.pulse.entity.JobAttempt;
import com.pulse.entity.JobAttemptStatus;
import com.pulse.entity.JobStatus;
import com.pulse.repository.JobAttemptRepository;
import com.pulse.repository.JobRepository;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.stereotype.Service;
import java.nio.file.Path;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Service
public class JobWorker {

    private final StringRedisTemplate redisTemplate;
    private final JobRepository jobRepository;
    private final JobAttemptRepository jobAttemptRepository;
    private final PulseMetricsService pulseMetricsService;
    private final JobStatusHistoryService jobStatusHistoryService;
    private final JobExecutor jobExecutor;

    public JobWorker(
            StringRedisTemplate redisTemplate,
            JobRepository jobRepository,
            JobAttemptRepository jobAttemptRepository,
            PulseMetricsService pulseMetricsService,
            JobStatusHistoryService jobStatusHistoryService,
            JobExecutor jobExecutor) {

        this.redisTemplate = redisTemplate;
        this.jobRepository = jobRepository;
        this.jobAttemptRepository = jobAttemptRepository;
        this.pulseMetricsService = pulseMetricsService;
        this.jobStatusHistoryService = jobStatusHistoryService;
        this.jobExecutor = jobExecutor;
    }

    @PostConstruct
    public void startWorker() {

        String stream = RedisStreamConfig.STREAM_KEY;
        String group = RedisStreamConfig.CONSUMER_GROUP;

        try {

            redisTemplate.opsForStream().createGroup(
                    stream,
                    ReadOffset.from("0-0"),
                    group
            );

        } catch (Exception ignored) {

            // Consumer group already exists.
        }

        StreamMessageListenerContainer<
                String,
                MapRecord<String, String, String>
                > container =
                StreamMessageListenerContainer.create(
                        redisTemplate.getConnectionFactory(),
                        StreamMessageListenerContainer
                                .StreamMessageListenerContainerOptions
                                .builder()
                                .pollTimeout(Duration.ofSeconds(1))
                                .build()
                );

        container.receive(
                Consumer.from(
                        group,
                        RedisStreamConfig.CONSUMER_NAME
                ),
                StreamOffset.create(
                        stream,
                        ReadOffset.lastConsumed()
                ),
                message -> processRecoveredMessage(
                        stream,
                        group,
                        message
                )
        );

        container.start();

        System.out.println("Pulse worker started.");
    }

    public void processRecoveredMessage(
            String stream,
            String group,
            MapRecord<String, String, String> message) {

        System.out.println(
                "Received job event: " +
                        message.getValue()
        );

        String jobIdValue =
                message.getValue().get("jobId");

        if (jobIdValue == null) {

            System.out.println(
                    "Job event does not contain jobId."
            );

            return;
        }

        Long jobId;

        try {

            jobId = Long.valueOf(jobIdValue);

        } catch (NumberFormatException e) {

            System.out.println(
                    "Invalid jobId: " +
                            jobIdValue
            );

            return;
        }

        var optionalJob =
                jobRepository.findById(jobId);

        if (optionalJob.isEmpty()) {

            System.out.println(
                    "Job " + jobId +
                            " was not found."
            );

            return;
        }

        Job job = optionalJob.get();

        /*
         * If the job has already reached the maximum
         * number of attempts, move it to the DLQ
         * and acknowledge the Redis message.
         */
        if (job.getAttemptCount()
                >= RedisStreamConfig.MAX_ATTEMPTS) {

            moveToDeadLetterQueue(
                    stream,
                    group,
                    message,
                    job
            );

            return;
        }

        JobAttempt attempt = null;

        /*
         * Timer is declared outside the try block so
         * both success and failure paths can record it.
         */
        Timer.Sample processingTimer = null;

        try {

            // Increment attempt counter
            job.incrementAttemptCount();

            // Move job into PROCESSING state
            job.setStatus(
                    JobStatus.PROCESSING
            );

            job.setUpdatedAt(
                    Instant.now()
            );

            jobRepository.save(job);

            // Record PROCESSING status history
            jobStatusHistoryService.record(
                    job,
                    JobStatus.PROCESSING
            );

            // Create persistent attempt history
            attempt = new JobAttempt(
                    job,
                    job.getAttemptCount(),
                    JobAttemptStatus.RUNNING,
                    Instant.now()
            );

            jobAttemptRepository.save(attempt);

            // Record attempt metric
            pulseMetricsService.jobAttempted();

            // Start processing timer
            processingTimer =
                    pulseMetricsService.startProcessingTimer();

            System.out.println(
                    "Job " + jobId +
                            " is now PROCESSING. Attempt " +
                            job.getAttemptCount()
            );

            // Process the job
            Path resultPath = processJob(job);
            if (resultPath != null) {
                job.setResultPath(resultPath.toString());
            }

            // Job completed successfully
            job.setStatus(
                    JobStatus.COMPLETED
            );

            job.setUpdatedAt(
                    Instant.now()
            );

            jobRepository.save(job);

            // Record COMPLETED status history
            jobStatusHistoryService.record(
                    job,
                    JobStatus.COMPLETED
            );

            // Mark attempt as completed
            attempt.setStatus(
                    JobAttemptStatus.COMPLETED
            );

            attempt.setCompletedAt(
                    Instant.now()
            );

            jobAttemptRepository.save(attempt);

            // Record successful job metrics
            pulseMetricsService.jobCompleted();

            if (processingTimer != null) {
                pulseMetricsService.recordProcessingTime(
                        processingTimer
                );
            }

            System.out.println(
                    "Job " + jobId +
                            " is now COMPLETED."
            );

            // Acknowledge Redis message
            redisTemplate.opsForStream().acknowledge(
                    stream,
                    group,
                    message.getId()
            );

            System.out.println(
                    "Job " + jobId +
                            " message acknowledged."
            );

        } catch (Exception e) {

            // Mark job as FAILED
            job.setStatus(
                    JobStatus.FAILED
            );

            job.setUpdatedAt(
                    Instant.now()
            );

            jobRepository.save(job);

            // Record FAILED status history
            jobStatusHistoryService.record(
                    job,
                    JobStatus.FAILED
            );

            // Mark current attempt as failed
            if (attempt != null) {

                attempt.setStatus(
                        JobAttemptStatus.FAILED
                );

                attempt.setCompletedAt(
                        Instant.now()
                );

                attempt.setErrorMessage(
                        e.getMessage()
                );

                jobAttemptRepository.save(attempt);
            }

            // Record failed job metrics
            pulseMetricsService.jobFailed();

            if (processingTimer != null) {
                pulseMetricsService.recordProcessingTime(
                        processingTimer
                );
            }

            System.out.println(
                    "Job " + jobId +
                            " FAILED on attempt " +
                            job.getAttemptCount() +
                            ": " +
                            e.getMessage()
            );

            /*
             * Do not acknowledge the Redis message while
             * another retry is available.
             */
            if (job.getAttemptCount()
                    < RedisStreamConfig.MAX_ATTEMPTS) {

                System.out.println(
                        "Job " + jobId +
                                " is eligible for retry."
                );

            } else {

                moveToDeadLetterQueue(
                        stream,
                        group,
                        message,
                        job
                );
            }
        }
    }

    private void moveToDeadLetterQueue(
            String stream,
            String group,
            MapRecord<String, String, String> message,
            Job job) {

        redisTemplate.opsForStream().add(
                RedisStreamConfig.DLQ_STREAM_KEY,
                Map.of(
                        "jobId",
                        String.valueOf(job.getId()),

                        "name",
                        job.getName(),

                        "reason",
                        "Maximum retry attempts exceeded"
                )
        );

        redisTemplate.opsForStream().acknowledge(
                stream,
                group,
                message.getId()
        );

        System.out.println(
                "Job " + job.getId() +
                        " moved to DLQ and original message acknowledged."
        );
    }

    private Path processJob(Job job) {

        System.out.println(
                "Processing job " +
                        job.getId() +
                        " — NAME = [" +
                        job.getName() +
                        "]"
        );

        /*
         * Controlled failure mode used only for
         * retry/DLQ testing.
         */
        if (job.getName().contains("FAIL_RETRY")) {

            System.out.println(
                    "FAIL_RETRY MATCHED — THROWING EXCEPTION"
            );

            throw new IllegalStateException(
                    "Simulated processing failure for retry testing"
            );
        }

        /*
         * Real job execution.
         */
        Path resultPath = jobExecutor.execute(job);

        System.out.println(
                "Job " + job.getId() +
                        " processing completed successfully."
        );

        return resultPath;
    }
}