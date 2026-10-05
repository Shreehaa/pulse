import api from "./api";
import type {
    Job,
    JobStatusHistory,
} from "../types/job";

export async function getJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>("/api/jobs");

    return response.data;
}

export async function getJobById(
    id: number,
): Promise<Job> {
    const response = await api.get<Job>(
        `/api/jobs/${id}`,
    );

    return response.data;
}

export async function createJob(
    name: string,
): Promise<Job> {
    const idempotencyKey = crypto.randomUUID();

    const response = await api.post<Job>(
        "/api/jobs",
        {
            name,
        },
        {
            headers: {
                "Idempotency-Key": idempotencyKey,
            },
        },
    );

    return response.data;
}

export async function getJobHistory(
    id: number,
): Promise<JobStatusHistory[]> {
    const response = await api.get<JobStatusHistory[]>(
        `/api/jobs/${id}/history`,
    );

    return response.data;
}