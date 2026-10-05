package com.pulse.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

@Service
public class PulseMetricsService {

    private final Counter jobsCreated;
    private final Counter jobsCompleted;
    private final Counter jobsFailed;
    private final Counter jobAttempts;
    private final Timer jobProcessingTime;

    public PulseMetricsService(MeterRegistry meterRegistry) {

        jobsCreated = Counter.builder("pulse.jobs.created")
                .description("Total number of jobs created")
                .register(meterRegistry);

        jobsCompleted = Counter.builder("pulse.jobs.completed")
                .description("Total number of jobs completed")
                .register(meterRegistry);

        jobsFailed = Counter.builder("pulse.jobs.failed")
                .description("Total number of jobs failed")
                .register(meterRegistry);

        jobAttempts = Counter.builder("pulse.jobs.attempts")
                .description("Total number of job processing attempts")
                .register(meterRegistry);

        jobProcessingTime = Timer.builder("pulse.jobs.processing.time")
                .description("Time spent processing jobs")
                .register(meterRegistry);
    }

    public void jobCreated() {
        jobsCreated.increment();
    }

    public void jobCompleted() {
        jobsCompleted.increment();
    }

    public void jobFailed() {
        jobsFailed.increment();
    }

    public void jobAttempted() {
        jobAttempts.increment();
    }

    public Timer.Sample startProcessingTimer() {
        return Timer.start();
    }

    public void recordProcessingTime(
            Timer.Sample sample) {

        sample.stop(jobProcessingTime);
    }
}