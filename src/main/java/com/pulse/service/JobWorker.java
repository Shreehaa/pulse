package com.pulse.service;

import com.pulse.config.RedisStreamConfig;
import com.pulse.entity.Job;
import com.pulse.entity.JobStatus;
import com.pulse.repository.JobRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;

@Service
public class JobWorker {

    private final StringRedisTemplate redisTemplate;
    private final JobRepository jobRepository;

    public JobWorker(
            StringRedisTemplate redisTemplate,
            JobRepository jobRepository) {

        this.redisTemplate = redisTemplate;
        this.jobRepository = jobRepository;
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

        System.out.println(
                "Pulse worker started."
        );
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

            jobId = Long.valueOf(
                    jobIdValue
            );

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
         * and acknowledge the original Redis message.
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

        try {

            job.incrementAttemptCount();

            job.setStatus(
                    JobStatus.PROCESSING
            );

            job.setUpdatedAt(
                    java.time.Instant.now()
            );

            jobRepository.save(job);

            System.out.println(
                    "Job " + jobId +
                            " is now PROCESSING. Attempt " +
                            job.getAttemptCount()
            );

            processJob(jobId);

            job.setStatus(
                    JobStatus.COMPLETED
            );

            job.setUpdatedAt(
                    java.time.Instant.now()
            );

            jobRepository.save(job);

            System.out.println(
                    "Job " + jobId +
                            " is now COMPLETED."
            );

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

            job.setStatus(
                    JobStatus.FAILED
            );

            job.setUpdatedAt(
                    java.time.Instant.now()
            );

            jobRepository.save(job);

            System.out.println(
                    "Job " + jobId +
                            " FAILED on attempt " +
                            job.getAttemptCount() +
                            ": " +
                            e.getMessage()
            );

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

    private void processJob(Long jobId) {

        System.out.println(
                "Processing job " + jobId
        );

        try {

            Thread.sleep(1000);

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Job processing interrupted",
                    e
            );
        }
    }
}