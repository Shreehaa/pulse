import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Layers3,
    RefreshCw,
    TrendingUp,
    XCircle,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MetricCard from "../components/dashboard/MetricCard";
import RecentJobs from "../components/dashboard/RecentJobs";
import SystemHealth from "../components/dashboard/SystemHealth";
import { getJobs } from "../services/jobService";
import type { Job } from "../types/job";

function DashboardPage() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadJobs(isRefresh = false) {
        try {
            setError(null);

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getJobs();

            setJobs(data);
        } catch (err) {
            console.error("Failed to load dashboard:", err);

            setError(
                "Unable to load jobs. Please check that the Pulse API is running.",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        void loadJobs();
    }, []);

    const metrics = useMemo(() => {
        const total = jobs.length;

        const pending = jobs.filter(
            (job) => job.status === "PENDING",
        ).length;

        const processing = jobs.filter(
            (job) => job.status === "PROCESSING",
        ).length;

        const completed = jobs.filter(
            (job) => job.status === "COMPLETED",
        ).length;

        const failed = jobs.filter(
            (job) => job.status === "FAILED",
        ).length;

        const attempts = jobs.reduce(
            (sum, job) => sum + job.attemptCount,
            0,
        );

        const retried = jobs.filter(
            (job) => job.attemptCount > 1,
        ).length;

        const successRate =
            total > 0
                ? Math.round((completed / total) * 100)
                : 0;

        const failureRate =
            total > 0
                ? Math.round((failed / total) * 100)
                : 0;

        const active = pending + processing;

        return {
            total,
            pending,
            processing,
            completed,
            failed,
            attempts,
            retried,
            successRate,
            failureRate,
            active,
        };
    }, [jobs]);

    const latestJob = useMemo(() => {
        return [...jobs].sort(
            (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
        )[0];
    }, [jobs]);

    const pipeline = [
        {
            label: "Pending",
            value: metrics.pending,
            description: "Waiting for workers",
            icon: Clock3,
        },
        {
            label: "Processing",
            value: metrics.processing,
            description: "Currently executing",
            icon: Activity,
        },
        {
            label: "Completed",
            value: metrics.completed,
            description: "Successfully processed",
            icon: CheckCircle2,
        },
        {
            label: "Failed",
            value: metrics.failed,
            description: "Require attention",
            icon: XCircle,
        },
    ];

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-heading">
                    <div>
                        <span className="page-eyebrow">
                            Operations
                        </span>

                        <div className="skeleton dashboard-title-skeleton" />

                        <div className="skeleton dashboard-subtitle-skeleton" />
                    </div>
                </div>

                <div className="dashboard-metrics-grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            className="skeleton dashboard-metric-skeleton"
                            key={index}
                        />
                    ))}
                </div>

                <div className="dashboard-health-skeleton skeleton" />

                <div className="dashboard-content-grid">
                    <div className="skeleton dashboard-large-skeleton" />

                    <div className="skeleton dashboard-side-skeleton" />
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            {/* HEADER */}

            <div className="dashboard-heading">
                <div>
                    <span className="page-eyebrow">
                        Operations
                    </span>

                    <h1>Dashboard</h1>

                    <p>
                        Monitor workflow activity, processing health,
                        and job execution across Pulse.
                    </p>
                </div>

                <div className="dashboard-heading-actions">
                    <div className="dashboard-live-status">
                        <span />
                        Live data
                    </div>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => loadJobs(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={15}
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

            {/* ERROR */}

            {error && (
                <div className="dashboard-error">
                    <XCircle size={18} />

                    <div>
                        <strong>
                            Dashboard data unavailable
                        </strong>

                        <span>{error}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadJobs()}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* KPI GRID */}

            <section
                className="dashboard-metrics-grid"
                aria-label="Workflow metrics"
            >
                <MetricCard
                    label="Total jobs"
                    value={metrics.total}
                    description="All submitted workflows"
                    icon={Layers3}
                />

                <MetricCard
                    label="Active workload"
                    value={metrics.active}
                    description="Pending + processing"
                    icon={Zap}
                />

                <MetricCard
                    label="Processing"
                    value={metrics.processing}
                    description="Currently executing"
                    icon={Activity}
                />

                <MetricCard
                    label="Completed"
                    value={metrics.completed}
                    description={`${metrics.successRate}% success rate`}
                    icon={CheckCircle2}
                />

                <MetricCard
                    label="Failed"
                    value={metrics.failed}
                    description={
                        metrics.failed > 0
                            ? "Requires attention"
                            : "No failed jobs"
                    }
                    icon={XCircle}
                />

                <MetricCard
                    label="Total attempts"
                    value={metrics.attempts}
                    description={`${metrics.retried} retried jobs`}
                    icon={TrendingUp}
                />
            </section>

            {/* HEALTH OVERVIEW */}

            <section className="dashboard-health-card">
                <div className="dashboard-health-header">
                    <div>
                        <span className="dashboard-section-label">
                            Workflow health
                        </span>

                        <h2>
                            Pulse processing overview
                        </h2>

                        <p>
                            Current state of submitted workflows and
                            processing reliability.
                        </p>
                    </div>

                    <div className="dashboard-health-score">
                        <strong>
                            {metrics.successRate}%
                        </strong>

                        <span>
                            completion rate
                        </span>
                    </div>
                </div>

                <div className="dashboard-health-bar">
                    <div
                        style={{
                            width: `${metrics.successRate}%`,
                        }}
                    />
                </div>

                <div className="dashboard-health-meta">
                    <span>
                        <CheckCircle2 size={14} />
                        {metrics.completed} completed
                    </span>

                    <span>
                        <XCircle size={14} />
                        {metrics.failed} failed
                    </span>

                    <span>
                        <Activity size={14} />
                        {metrics.processing} processing
                    </span>

                    <span>
                        <Clock3 size={14} />
                        {metrics.pending} pending
                    </span>
                </div>
            </section>

            {/* PIPELINE */}

            <section className="dashboard-pipeline-card">
                <div className="dashboard-section-header">
                    <div>
                        <span className="dashboard-section-label">
                            Execution flow
                        </span>

                        <h2>Processing pipeline</h2>

                        <p>
                            See where jobs currently sit in the
                            asynchronous workflow.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-link-button"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >
                        Analytics
                        <ArrowRight size={15} />
                    </button>
                </div>

                <div className="dashboard-pipeline">
                    {pipeline.map((stage, index) => {
                        const Icon = stage.icon;

                        return (
                            <div
                                className="dashboard-pipeline-group"
                                key={stage.label}
                            >
                                <div className="dashboard-pipeline-stage">
                                    <div className="dashboard-pipeline-icon">
                                        <Icon size={17} />
                                    </div>

                                    <div>
                                        <span>
                                            {stage.label}
                                        </span>

                                        <strong>
                                            {stage.value}
                                        </strong>

                                        <small>
                                            {stage.description}
                                        </small>
                                    </div>
                                </div>

                                {index <
                                    pipeline.length - 1 && (
                                        <ArrowRight
                                            size={17}
                                            className="dashboard-pipeline-arrow"
                                        />
                                    )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* MAIN CONTENT */}

            <section className="dashboard-content-grid">
                <div className="dashboard-recent-wrapper">
                    <RecentJobs jobs={jobs} />
                </div>

                <div className="dashboard-side-column">
                    <SystemHealth />

                    <div className="dashboard-latest-card">
                        <div className="dashboard-section-header">
                            <div>
                                <span className="dashboard-section-label">
                                    Latest activity
                                </span>

                                <h2>Last updated job</h2>
                            </div>
                        </div>

                        {latestJob ? (
                            <button
                                type="button"
                                className="dashboard-latest-job"
                                onClick={() =>
                                    navigate(
                                        `/jobs/${latestJob.id}`,
                                    )
                                }
                            >
                                <div className="dashboard-latest-icon">
                                    {latestJob.status ===
                                    "COMPLETED" ? (
                                        <CheckCircle2 size={18} />
                                    ) : latestJob.status ===
                                    "FAILED" ? (
                                        <XCircle size={18} />
                                    ) : (
                                        <Activity size={18} />
                                    )}
                                </div>

                                <div>
                                    <strong>
                                        {latestJob.name}
                                    </strong>

                                    <span>
                                        Job #{latestJob.id} ·{" "}
                                        {new Date(
                                            latestJob.updatedAt,
                                        ).toLocaleString()}
                                    </span>
                                </div>

                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <div className="dashboard-latest-empty">
                                No jobs have been created yet.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FAILURE ALERT */}

            {metrics.failed > 0 && (
                <section className="dashboard-failure-summary">
                    <div className="dashboard-failure-icon">
                        <XCircle size={18} />
                    </div>

                    <div>
                        <strong>
                            {metrics.failed} failed{" "}
                            {metrics.failed === 1
                                ? "job"
                                : "jobs"}{" "}
                            require attention
                        </strong>

                        <span>
                            Review failed workflows and inspect their
                            execution history.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/failed-jobs")
                        }
                    >
                        Review failures
                        <ArrowRight size={15} />
                    </button>
                </section>
            )}
        </main>
    );
}

export default DashboardPage;