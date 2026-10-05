package com.pulse.entity;

import jakarta.persistence.*;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "job_status_history")
public class JobStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    @JsonIgnore
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;

    @Column(nullable = false)
    private Instant changedAt;

    public JobStatusHistory() {
    }

    public JobStatusHistory(
            Job job,
            JobStatus status,
            Instant changedAt) {

        this.job = job;
        this.status = status;
        this.changedAt = changedAt;
    }

    public Long getId() {
        return id;
    }

    public Job getJob() {
        return job;
    }

    public JobStatus getStatus() {
        return status;
    }

    public Instant getChangedAt() {
        return changedAt;
    }
}