package com.pulse.config;

public final class RedisStreamConfig {

    private RedisStreamConfig() {
    }

    public static final String STREAM_KEY = "pulse:jobs";

    public static final String DLQ_STREAM_KEY = "pulse:jobs:dlq";

    public static final String CONSUMER_GROUP = "pulse-workers";

    public static final String CONSUMER_NAME = "worker-1";

    public static final int MAX_ATTEMPTS = 3;

    public static final long RETRY_DELAY_MILLIS = 5000;
}