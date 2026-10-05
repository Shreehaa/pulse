package com.pulse.service;

import com.pulse.entity.Job;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;

@Service
public class ReportJobExecutor implements JobExecutor {

    private final Path resultsDirectory;

    public ReportJobExecutor(
            @Value("${pulse.job-results-dir:data/job-results}")
            String resultsDirectory) {

        this.resultsDirectory =
                Paths.get(resultsDirectory)
                        .toAbsolutePath()
                        .normalize();
    }

    @Override
    public Path execute(Job job) {

        try {

            Files.createDirectories(resultsDirectory);

            String safeJobName =
                    job.getName()
                            .replaceAll("[^a-zA-Z0-9-_]", "_");

            String fileName =
                    "job-" +
                            job.getId() +
                            "-" +
                            safeJobName +
                            ".csv";

            Path resultFile =
                    resultsDirectory.resolve(fileName);

            String content =
                    "job_id,job_name,status,processed_at\n" +
                            job.getId() +
                            "," +
                            escapeCsv(job.getName()) +
                            ",COMPLETED," +
                            Instant.now() +
                            "\n";

            Files.writeString(
                    resultFile,
                    content,
                    StandardCharsets.UTF_8
            );

            System.out.println(
                    "Real job execution completed. Result file: " +
                            resultFile
            );

            return resultFile;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Failed to generate report for job " +
                            job.getId(),
                    e
            );
        }
    }

    private String escapeCsv(String value) {

        if (value == null) {
            return "";
        }

        String escaped =
                value.replace("\"", "\"\"");

        if (escaped.contains(",") ||
                escaped.contains("\"") ||
                escaped.contains("\n")) {

            return "\"" + escaped + "\"";
        }

        return escaped;
    }
}