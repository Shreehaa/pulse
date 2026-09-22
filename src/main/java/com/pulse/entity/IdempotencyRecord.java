package com.pulse.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "idempotency_records",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_idempotency_key",
                        columnNames = "idempotency_key"
                )
        }
)
public class IdempotencyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "idempotency_key",
            nullable = false,
            unique = true,
            length = 100
    )
    private String idempotencyKey;

    @Column(
            name = "request_fingerprint",
            nullable = false,
            length = 64
    )
    private String requestFingerprint;

    @Column(
            name = "job_id",
            nullable = false
    )
    private Long jobId;

    @Column(
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    public IdempotencyRecord() {
    }

    public IdempotencyRecord(
            String idempotencyKey,
            String requestFingerprint,
            Long jobId) {

        this.idempotencyKey = idempotencyKey;
        this.requestFingerprint = requestFingerprint;
        this.jobId = jobId;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getRequestFingerprint() {
        return requestFingerprint;
    }

    public Long getJobId() {
        return jobId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}