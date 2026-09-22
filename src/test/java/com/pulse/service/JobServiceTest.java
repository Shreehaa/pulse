package com.pulse.service;

import com.pulse.entity.IdempotencyRecord;
import com.pulse.entity.Job;
import com.pulse.entity.JobStatus;
import com.pulse.exception.IdempotencyConflictException;
import com.pulse.repository.IdempotencyRecordRepository;
import com.pulse.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private JobEventPublisher jobEventPublisher;

    @Mock
    private IdempotencyRecordRepository idempotencyRecordRepository;

    @InjectMocks
    private JobService jobService;

    @Test
    void shouldCreateNewJobWhenIdempotencyKeyIsNew() {

        when(idempotencyRecordRepository
                .findByIdempotencyKey("test-key"))
                .thenReturn(Optional.empty());

        Job savedJob =
                new Job(
                        "test-job",
                        JobStatus.PENDING
                );

        when(jobRepository.save(any(Job.class)))
                .thenReturn(savedJob);

        Job result =
                jobService.createJob(
                        "test-job",
                        "test-key"
                );

        assertNotNull(result);

        assertEquals(
                "test-job",
                result.getName()
        );

        verify(jobRepository)
                .save(any(Job.class));

        verify(idempotencyRecordRepository)
                .save(any(IdempotencyRecord.class));

        verify(jobEventPublisher)
                .publishJobCreated(savedJob);
    }

    @Test
    void shouldRejectDifferentRequestWithSameIdempotencyKey() {

        Job existingJob =
                new Job(
                        "original-job",
                        JobStatus.PENDING
                );

        when(idempotencyRecordRepository
                .findByIdempotencyKey("test-key"))
                .thenReturn(
                        Optional.of(
                                new IdempotencyRecord(
                                        "test-key",
                                        "some-fingerprint",
                                        1L
                                )
                        )
                );

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob));

        assertThrows(
                IdempotencyConflictException.class,
                () -> jobService.createJob(
                        "different-job",
                        "test-key"
                )
        );

        verify(jobRepository, never())
                .save(any(Job.class));

        verify(jobEventPublisher, never())
                .publishJobCreated(any(Job.class));
    }

    @Test
    void shouldReturnExistingJobWhenSameIdempotencyKeyAndRequestIsRepeated() {

        Job existingJob =
                new Job(
                        "original-job",
                        JobStatus.PENDING
                );

        when(idempotencyRecordRepository
                .findByIdempotencyKey("test-key"))
                .thenReturn(
                        Optional.of(
                                new IdempotencyRecord(
                                        "test-key",
                                        "some-fingerprint",
                                        1L
                                )
                        )
                );

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob));

        Job result =
                jobService.createJob(
                        "original-job",
                        "test-key"
                );

        assertNotNull(result);

        assertEquals(
                "original-job",
                result.getName()
        );

        verify(jobRepository, never())
                .save(any(Job.class));

        verify(idempotencyRecordRepository, never())
                .save(any(IdempotencyRecord.class));

        verify(jobEventPublisher, never())
                .publishJobCreated(any(Job.class));
    }

    @Test
    void shouldReturnAllJobs() {

        Job firstJob =
                new Job(
                        "first-job",
                        JobStatus.COMPLETED
                );

        Job secondJob =
                new Job(
                        "second-job",
                        JobStatus.PENDING
                );

        when(jobRepository.findAll())
                .thenReturn(
                        List.of(
                                firstJob,
                                secondJob
                        )
                );

        List<Job> result =
                jobService.getAllJobs();

        assertNotNull(result);

        assertEquals(
                2,
                result.size()
        );

        assertEquals(
                "first-job",
                result.get(0).getName()
        );

        assertEquals(
                "second-job",
                result.get(1).getName()
        );

        verify(jobRepository)
                .findAll();
    }
}

