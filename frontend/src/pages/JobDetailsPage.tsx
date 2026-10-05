import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Download,
    RefreshCw,
    Server,
    XCircle,
    Zap,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getJobById,
    getJobHistory,
} from "../services/jobService";

import type {
    Job,
    JobStatusHistory,
} from "../types/job";

function JobDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [job, setJob] = useState<Job | null>(null);

    const [history, setHistory] =
        useState<JobStatusHistory[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadJob = useCallback(
        async (isRefresh = false) => {
            if (!id) {
                setError("Job ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setError("");

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const [jobData, historyData] =
                    await Promise.all([
                        getJobById(Number(id)),
                        getJobHistory(Number(id)),
                    ]);

                setJob(jobData);
                setHistory(historyData);
            } catch (err) {
                console.error(
                    "Failed to load job:",
                    err,
                );

                setError(
                    "Unable to load this job. It may no longer exist or the Pulse API may be unavailable.",
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [id],
    );

    const handleDownloadResult =
        async () => {
            if (!job?.resultPath) {
                return;
            }

            try {
                const token =
                    localStorage.getItem(
                        "pulse_token",
                    );

                const response =
                    await fetch(
                        `http://localhost:8080/api/jobs/${job.id}/result`,
{
    headers: {
        Authorization: `Bearer ${token}`,
    },
},
);

if (!response.ok) {
    throw new Error(
        `Download failed with status ${response.status}`,
    );
}

const blob =
    await response.blob();

const url =
    window.URL.createObjectURL(
        blob,
    );

const link =
    document.createElement(
        "a",
    );

link.href = url;

link.download =
    `job-${job.id}-result.csv`;

document.body.appendChild(
    link,
);

link.click();
link.remove();

window.URL.revokeObjectURL(
    url,
);
} catch (err) {
    console.error(
        "Failed to download job result:",
        err,
    );

    setError(
        "Unable to download the job result.",
    );
}
};

useEffect(() => {
    loadJob();
}, [loadJob]);

const statusInfo =
    useMemo(() => {
        if (!job) {
            return {
                label: "Unknown",
                description:
                    "Job status is unavailable.",
                icon: Clock3,
                className:
                    "job-details-status-unknown",
            };
        }

        switch (job.status) {
            case "COMPLETED":
                return {
                    label: "Completed",
                    description:
                        "The job has been processed successfully.",
                    icon: CheckCircle2,
                    className:
                        "job-details-status-completed",
                };

            case "FAILED":
                return {
                    label: "Failed",
                    description:
                        "The job could not be completed successfully.",
                    icon: XCircle,
                    className:
                        "job-details-status-failed",
                };

            case "PROCESSING":
                return {
                    label: "Processing",
                    description:
                        "The worker is currently processing this job.",
                    icon: Zap,
                    className:
                        "job-details-status-processing",
                };

            case "PENDING":
                return {
                    label: "Pending",
                    description:
                        "The job is waiting to be processed.",
                    icon: Clock3,
                    className:
                        "job-details-status-pending",
                };

            default:
                return {
                    label: job.status,
                    description:
                        "Current job state.",
                    icon: Clock3,
                    className:
                        "job-details-status-unknown",
                };
        }
    }, [job]);

const StatusIcon =
    statusInfo.icon;

if (loading) {
    return (
        <main className="page-content">
            <div className="job-details-loading">
                <div className="skeleton job-details-skeleton-back" />

                <div className="skeleton job-details-skeleton-title" />

                <div className="job-details-skeleton-grid">
                    <div className="skeleton job-details-skeleton-card" />
                    <div className="skeleton job-details-skeleton-card" />
                    <div className="skeleton job-details-skeleton-card" />
                </div>

                <div className="skeleton job-details-skeleton-panel" />
            </div>
        </main>
    );
}

if (error || !job) {
    return (
        <main className="page-content">
            <div className="job-details-error-page">
                <div className="job-details-error-icon">
                    <XCircle size={30} />
                </div>

                <h1>
                    Job unavailable
                </h1>

                <p>
                    {error ||
                        "The requested job could not be found."}
                </p>

                <div className="job-details-error-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/jobs",
                            )
                        }
                    >
                        <ArrowLeft
                            size={16}
                        />
                        Back to Jobs
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                            loadJob()
                        }
                    >
                        <RefreshCw
                            size={16}
                        />
                        Try Again
                    </button>
                </div>
            </div>
        </main>
    );
}

return (
    <main className="page-content">
        <div className="job-details-topbar">
            <button
                type="button"
                className="back-button"
                onClick={() =>
                    navigate("/jobs")
                }
            >
                <ArrowLeft size={17} />
                Back to Jobs
            </button>

            <div className="job-details-topbar-actions">
                {job.status ===
                    "COMPLETED" &&
                    job.resultPath && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                handleDownloadResult
                            }
                        >
                            <Download
                                size={16}
                            />
                            Download Result
                        </button>
                    )}

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        loadJob(true)
                    }
                    disabled={
                        refreshing
                    }
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "spin-animation"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
            </div>
        </div>

        <section className="job-details-hero">
            <div>
                    <span className="page-eyebrow">
                        Job Details
                    </span>

                <div className="job-details-title-row">
                    <h1>
                        {job.name}
                    </h1>

                    <span className="job-details-id">
                            #{job.id}
                        </span>
                </div>

                <p className="job-details-description">
                    Detailed execution
                    information and
                    current processing
                    state for this
                    workflow job.
                </p>
            </div>

            <div
                className={`job-details-status ${statusInfo.className}`}
            >
                <StatusIcon
                    size={18}
                />

                <div>
                    <strong>
                        {
                            statusInfo.label
                        }
                    </strong>

                    <span>
                            {
                                statusInfo.description
                            }
                        </span>
                </div>
            </div>
        </section>

        <section className="job-details-metrics">
            <div className="job-details-metric">
                <div className="job-details-metric-icon">
                    <Server size={18} />
                </div>

                <div>
                        <span>
                            Job ID
                        </span>

                    <strong>
                        #{job.id}
                    </strong>
                </div>
            </div>

            <div className="job-details-metric">
                <div className="job-details-metric-icon">
                    <Zap size={18} />
                </div>

                <div>
                        <span>
                            Attempts
                        </span>

                    <strong>
                        {
                            job.attemptCount
                        }
                    </strong>
                </div>
            </div>

            <div className="job-details-metric">
                <div className="job-details-metric-icon">
                    <Clock3 size={18} />
                </div>

                <div>
                        <span>
                            Created
                        </span>

                    <strong>
                        {new Date(
                            job.createdAt,
                        ).toLocaleDateString()}
                    </strong>
                </div>
            </div>

            <div className="job-details-metric">
                <div className="job-details-metric-icon">
                    <RefreshCw
                        size={18}
                    />
                </div>

                <div>
                        <span>
                            Last Updated
                        </span>

                    <strong>
                        {new Date(
                            job.updatedAt,
                        ).toLocaleDateString()}
                    </strong>
                </div>
            </div>
        </section>

        <section className="job-details-content-grid">
            <div className="job-details-panel">
                <div className="job-details-panel-header">
                    <div>
                        <h2>
                            Processing
                            Lifecycle
                        </h2>

                        <p>
                            Current
                            position of
                            this job in
                            the Pulse
                            workflow.
                        </p>
                    </div>
                </div>

                <div className="job-lifecycle">
                    {history.length ===
                    0 ? (
                        <div className="empty-state">
                            <p>
                                No status
                                history
                                available
                                yet.
                            </p>
                        </div>
                    ) : (
                        history.map(
                            (
                                entry,
                                index,
                            ) => {
                                const isLast =
                                    index ===
                                    history.length -
                                    1;

                                const isFailed =
                                    entry.status ===
                                    "FAILED";

                                const isCompleted =
                                    entry.status ===
                                    "COMPLETED";

                                return (
                                    <div
                                        key={
                                            entry.id
                                        }
                                    >
                                        <div
                                            className={`job-lifecycle-step ${
                                                isFailed
                                                    ? "failed"
                                                    : isCompleted
                                                        ? "completed"
                                                        : !isLast
                                                            ? "completed"
                                                            : "active"
                                            }`}
                                        >
                                            <div className="job-lifecycle-marker">
                                                {isFailed ? (
                                                    <XCircle
                                                        size={
                                                            17
                                                        }
                                                    />
                                                ) : isCompleted ||
                                                !isLast ? (
                                                    <CheckCircle2
                                                        size={
                                                            17
                                                        }
                                                    />
                                                ) : (
                                                    <Clock3
                                                        size={
                                                            17
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <strong>
                                                    {entry.status ===
                                                    "PENDING"
                                                        ? "Submitted"
                                                        : entry.status ===
                                                        "PROCESSING"
                                                            ? "Processing"
                                                            : entry.status ===
                                                            "COMPLETED"
                                                                ? "Completed"
                                                                : "Failed"}
                                                </strong>

                                                <span>
                                                        {new Date(
                                                            entry.changedAt,
                                                        ).toLocaleString()}
                                                    </span>
                                            </div>
                                        </div>

                                        {!isLast && (
                                            <div className="job-lifecycle-line active" />
                                        )}
                                    </div>
                                );
                            },
                        )
                    )}
                </div>
            </div>

            <div className="job-details-panel">
                <div className="job-details-panel-header">
                    <div>
                        <h2>
                            Execution
                            Information
                        </h2>

                        <p>
                            Important
                            timestamps
                            and
                            processing
                            metadata.
                        </p>
                    </div>
                </div>

                <div className="job-details-info-list">
                    <div className="job-details-info-row">
                            <span>
                                Job name
                            </span>

                        <strong>
                            {job.name}
                        </strong>
                    </div>

                    <div className="job-details-info-row">
                            <span>
                                Status
                            </span>

                        <span
                            className={`status-badge status-${job.status.toLowerCase()}`}
                        >
                                {
                                    job.status
                                }
                            </span>
                    </div>

                    <div className="job-details-info-row">
                            <span>
                                Attempt
                                count
                            </span>

                        <strong>
                            {
                                job.attemptCount
                            }
                        </strong>
                    </div>

                    <div className="job-details-info-row">
                            <span>
                                Created at
                            </span>

                        <strong>
                            {new Date(
                                job.createdAt,
                            ).toLocaleString()}
                        </strong>
                    </div>

                    <div className="job-details-info-row">
                            <span>
                                Updated at
                            </span>

                        <strong>
                            {new Date(
                                job.updatedAt,
                            ).toLocaleString()}
                        </strong>
                    </div>
                </div>
            </div>
            <div className="job-details-history"
                 style={{
                     display: "block",
                     visibility: "visible",
                     minHeight: "200px",
                     background: "white",
                     border: "3px solid red",
                 }}
            >
                <div className="job-details-panel-header">
                    <div>
                        <h2 style={{ color: "red", fontSize: "40px" }}>
                            STATUS HISTORY TEST
                        </h2>

                        <p>
                            Timeline of status changes recorded for this job.
                        </p>
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="job-details-history-empty">
                        No status history is available for this job.
                    </div>
                ) : (
                    <div className="job-details-history-list">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="job-details-history-item"
                            >
                                <div className="job-details-history-marker">
                                    {item.status === "COMPLETED" ? (
                                        <CheckCircle2 size={16} />
                                    ) : item.status === "FAILED" ? (
                                        <XCircle size={16} />
                                    ) : item.status === "PROCESSING" ? (
                                        <Zap size={16} />
                                    ) : (
                                        <Clock3 size={16} />
                                    )}
                                </div>

                                <div className="job-details-history-content">
                                    <strong>{item.status}</strong>

                                    <span>
                            {new Date(
                                item.changedAt,
                            ).toLocaleString()}
                        </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    </main>
);
}

export default JobDetailsPage;

