package com.pulse.integration;

import com.pulse.entity.Job;
import com.pulse.entity.JobStatus;
import com.pulse.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest
class JobIntegrationTest {

    static {
        System.setProperty(
                "user.timezone",
                "Asia/Kolkata"
        );
    }

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16")
                    .withDatabaseName("pulse_test")
                    .withUsername("pulse")
                    .withPassword("pulse_test_password")
                    .withEnv("TZ", "Asia/Kolkata")
                    .withEnv("PGTZ", "Asia/Kolkata");

    @DynamicPropertySource
    static void configureDatabase(
            DynamicPropertyRegistry registry) {

        registry.add(
                "spring.datasource.url",
                postgres::getJdbcUrl
        );

        registry.add(
                "spring.datasource.username",
                postgres::getUsername
        );

        registry.add(
                "spring.datasource.password",
                postgres::getPassword
        );

        registry.add(
                "spring.datasource.driver-class-name",
                () -> "org.postgresql.Driver"
        );

        registry.add(
                "spring.jpa.database-platform",
                () -> "org.hibernate.dialect.PostgreSQLDialect"
        );
    }

    @Autowired
    private JobRepository jobRepository;

    @Test
    void shouldSaveAndRetrieveJobFromDatabase() {

        Job job =
                new Job(
                        "integration-test-job",
                        JobStatus.PENDING
                );

        Job savedJob =
                jobRepository.save(job);

        assertNotNull(savedJob.getId());

        Job retrievedJob =
                jobRepository
                        .findById(savedJob.getId())
                        .orElseThrow();

        assertEquals(
                "integration-test-job",
                retrievedJob.getName()
        );

        assertEquals(
                JobStatus.PENDING,
                retrievedJob.getStatus()
        );
    }
}