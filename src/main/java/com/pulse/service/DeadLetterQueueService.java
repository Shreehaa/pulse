package com.pulse.service;

import com.pulse.config.RedisStreamConfig;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeadLetterQueueService {

    private final StringRedisTemplate redisTemplate;

    public DeadLetterQueueService(
            StringRedisTemplate redisTemplate) {

        this.redisTemplate = redisTemplate;
    }

    public List<MapRecord<String, Object, Object>> getDeadLetterJobs() {

        return redisTemplate.opsForStream()
                .range(
                        RedisStreamConfig.DLQ_STREAM_KEY,
                        org.springframework.data.domain.Range.unbounded()
                );
    }
}