package com.pulse.service;

import com.pulse.config.RedisStreamConfig;
import com.pulse.entity.Job;
import com.pulse.entity.JobStatus;
import com.pulse.repository.JobRepository;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.PendingMessages;
import org.springframework.data.redis.connection.stream.PendingMessagesSummary;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;

@Service
public class JobRetryService {

    private final StringRedisTemplate redisTemplate;
    private final JobRepository jobRepository;
    private final JobWorker jobWorker;

    public JobRetryService(
            StringRedisTemplate redisTemplate,
            JobRepository jobRepository,
            JobWorker jobWorker) {

        this.redisTemplate = redisTemplate;
        this.jobRepository = jobRepository;
        this.jobWorker = jobWorker;
    }

    @Scheduled(
            fixedDelay = RedisStreamConfig.RETRY_DELAY_MILLIS
    )
    public void retryPendingJobs() {

        String stream = RedisStreamConfig.STREAM_KEY;
        String group = RedisStreamConfig.CONSUMER_GROUP;
        String consumer = RedisStreamConfig.CONSUMER_NAME;

        try {

            PendingMessagesSummary summary =
                    redisTemplate.opsForStream()
                            .pending(stream, group);

            if (summary == null
                    || summary.getTotalPendingMessages() == 0) {

                return;
            }

            System.out.println(
                    "Pending Redis messages: "
                            + summary.getTotalPendingMessages()
            );

            Consumer consumerInfo =
                    Consumer.from(group, consumer);

            PendingMessages pendingMessages =
                    redisTemplate.opsForStream()
                            .pending(
                                    stream,
                                    consumerInfo,
                                    org.springframework.data.domain.Range.unbounded(),
                                    10,
                                    Duration.ofMillis(
                                            RedisStreamConfig.RETRY_DELAY_MILLIS
                                    )
                            );

            if (pendingMessages == null) {
                return;
            }

            for (var pendingMessage : pendingMessages) {

                RecordId recordId = pendingMessage.getId();

                var claimedMessages =
                        redisTemplate.opsForStream()
                                .claim(
                                        stream,
                                        group,
                                        consumer,
                                        Duration.ofMillis(
                                                RedisStreamConfig.RETRY_DELAY_MILLIS
                                        ),
                                        recordId
                                );

                for (MapRecord<String, Object, Object> message
                        : claimedMessages) {

                    Object jobIdObject =
                            message.getValue().get("jobId");

                    if (jobIdObject == null) {
                        continue;
                    }

                    Long jobId;

                    try {

                        jobId = Long.valueOf(
                                String.valueOf(jobIdObject)
                        );

                    } catch (NumberFormatException e) {

                        System.out.println(
                                "Invalid jobId in retry message: "
                                        + jobIdObject
                        );

                        continue;
                    }

                    var optionalJob =
                            jobRepository.findById(jobId);

                    if (optionalJob.isEmpty()) {

                        System.out.println(
                                "Job " + jobId
                                        + " was not found."
                        );

                        continue;
                    }

                    Job job = optionalJob.get();

                    /*
                     * Convert the Redis message into the same
                     * type used by JobWorker.
                     */
                    MapRecord<String, String, String> convertedMessage =
                            org.springframework.data.redis.connection.stream.StreamRecords
                                    .newRecord()
                                    .in(stream)
                                    .ofMap(
                                            Map.of(
                                                    "jobId",
                                                    String.valueOf(
                                                            message.getValue().get("jobId")
                                                    ),
                                                    "name",
                                                    String.valueOf(
                                                            message.getValue().get("name")
                                                    )
                                            )
                                    )
                                    .withId(message.getId());

                    /*
                     * If the job has already reached the maximum
                     * attempts, let JobWorker move it to the DLQ
                     * and acknowledge the original message.
                     */
                    if (job.getAttemptCount()
                            >= RedisStreamConfig.MAX_ATTEMPTS) {

                        System.out.println(
                                "Job " + jobId
                                        + " has reached maximum attempts. "
                                        + "Sending to DLQ."
                        );

                        jobWorker.processRecoveredMessage(
                                stream,
                                group,
                                convertedMessage
                        );

                        continue;
                    }

                    System.out.println(
                            "Retrying job "
                                    + jobId
                                    + ". Attempt "
                                    + (job.getAttemptCount() + 1)
                    );

                    job.setStatus(
                            JobStatus.PENDING
                    );

                    job.setUpdatedAt(
                            java.time.Instant.now()
                    );

                    jobRepository.save(job);

                    jobWorker.processRecoveredMessage(
                            stream,
                            group,
                            convertedMessage
                    );
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "Retry service error: "
                            + e.getMessage()
            );
        }
    }
}

