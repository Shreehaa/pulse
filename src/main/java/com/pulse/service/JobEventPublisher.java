package com.pulse.service;

import com.pulse.entity.Job;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class JobEventPublisher {

    private final StringRedisTemplate redisTemplate;

    public JobEventPublisher(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void publishJobCreated(Job job) {

        redisTemplate.opsForStream().add(
                "pulse:jobs",
                Map.of(
                        "jobId", String.valueOf(job.getId()),
                        "name", job.getName()
                )
        );
    }
}