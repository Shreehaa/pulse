package com.pulse.controller;

import com.pulse.entity.Job;
import com.pulse.entity.JobStatus;
import com.pulse.service.JobService;
import com.pulse.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobService jobService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void shouldCreateJob() throws Exception {

        Job job =
                new Job(
                        "test-job",
                        JobStatus.PENDING
                );

        when(jobService.createJob(
                eq("test-job"),
                anyString()
        )).thenReturn(job);

        String requestBody =
                """
                {
                    "name": "test-job"
                }
                """;

        mockMvc.perform(
                        post("/api/jobs")
                                .header(
                                        "Idempotency-Key",
                                        "controller-test-key"
                                )
                                .contentType(
                                        "application/json"
                                )
                                .content(requestBody)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.name")
                                .value("test-job")
                )
                .andExpect(
                        jsonPath("$.status")
                                .value("PENDING")
                );
    }
}

