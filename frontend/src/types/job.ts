export type JobStatus =
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";

export interface Job {
    id: number;
    name: string;
    status: JobStatus;
    attemptCount: number;
    createdAt: string;
    updatedAt: string;
    resultPath?: string | null;
}

export interface JobStatusHistory {
    id: number;
    status: JobStatus;
    changedAt: string;
}