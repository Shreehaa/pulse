import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    RefreshCw,
    TrendingUp,
    XCircle,
    Zap,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";

import { getJobs } from "../services/jobService";
import type { Job } from "../types/job";

function AnalyticsPage() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    async function loadJobs(isRefresh = false) {
        try {
            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getJobs();

            setJobs(data);
        } catch (err) {
            console.error("Failed to load analytics:", err);

            setError(
                "Unable to load analytics. Please check that the Pulse API is running.",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadJobs();
    }, []);

    const statistics = useMemo(() => {
        const total = jobs.length;

        const completed = jobs.filter(
            (job) => job.status === "COMPLETED",
        ).length;

        const failed = jobs.filter(
            (job) => job.status === "FAILED",
        ).length;

        const pending = jobs.filter(
            (job) => job.status === "PENDING",
        ).length;

        const processing = jobs.filter(
            (job) => job.status === "PROCESSING",
        ).length;

        const active = pending + processing;

        const totalAttempts = jobs.reduce(
            (sum, job) => sum + job.attemptCount,
            0,
        );

        const retriedJobs = jobs.filter(
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

        const averageAttempts =
            total > 0
                ? (totalAttempts / total).toFixed(1)
                : "0.0";

        const retryRate =
            total > 0
                ? Math.round((retriedJobs / total) * 100)
                : 0;

        return {
            total,
            completed,
            failed,
            pending,
            processing,
            active,
            totalAttempts,
            retriedJobs,
            successRate,
            failureRate,
            averageAttempts,
            retryRate,
        };
    }, [jobs]);

    const statusData = useMemo(
        () =>
            [
                {
                    name: "Completed",
                    value: statistics.completed,
                    className: "completed",
                },
                {
                    name: "Failed",
                    value: statistics.failed,
                    className: "failed",
                },
                {
                    name: "Processing",
                    value: statistics.processing,
                    className: "processing",
                },
                {
                    name: "Pending",
                    value: statistics.pending,
                    className: "pending",
                },
            ].filter((item) => item.value > 0),
        [statistics],
    );

    const attemptsData = useMemo(() => {
        const attempts = new Map<number, number>();

        jobs.forEach((job) => {
            attempts.set(
                job.attemptCount,
                (attempts.get(job.attemptCount) ?? 0) + 1,
            );
        });

        return Array.from(attempts.entries())
            .sort(([a], [b]) => a - b)
            .map(([attempts, count]) => ({
                attempts: `${attempts}`,
                jobs: count,
            }));
    }, [jobs]);

    const recentJobs = useMemo(
        () =>
            [...jobs]
                .sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                )
                .slice(0, 6),
        [jobs],
    );

    const pipelineStages = useMemo(
        () => [
            {
                label: "Pending",
                value: statistics.pending,
                description: "Waiting for processing",
                icon: Clock3,
                className: "pending",
            },
            {
                label: "Processing",
                value: statistics.processing,
                description: "Currently being processed",
                icon: Activity,
                className: "processing",
            },
            {
                label: "Completed",
                value: statistics.completed,
                description: "Successfully completed",
                icon: CheckCircle2,
                className: "completed",
            },
            {
                label: "Failed",
                value: statistics.failed,
                description: "Require investigation",
                icon: XCircle,
                className: "failed",
            },
        ],
        [statistics],
    );

    if (loading) {
        return (
            <main className="page-content analytics-page">
                <div className="page-header">
                    <div>
                        <div className="skeleton analytics-skeleton-title" />
                        <div className="skeleton analytics-skeleton-subtitle" />
                    </div>
                </div>

                <div className="analytics-stat-grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            className="skeleton analytics-skeleton-card"
                            key={index}
                        />
                    ))}
                </div>

                <div className="analytics-health-skeleton">
                    <div className="skeleton analytics-skeleton-health" />
                </div>

                <div className="analytics-chart-grid">
                    <div className="skeleton analytics-skeleton-chart" />
                    <div className="skeleton analytics-skeleton-chart" />
                </div>

                <div className="analytics-bottom-grid">
                    <div className="skeleton analytics-skeleton-bottom" />
                    <div className="skeleton analytics-skeleton-bottom" />
                </div>
            </main>
        );
    }

    return (
        <main className="page-content analytics-page">
            <div className="page-header analytics-header">
                <div>
                    <span className="page-eyebrow">
                        System Insights
                    </span>

                    <h1>Analytics</h1>

                    <p className="page-description">
                        Monitor workflow performance, reliability,
                        processing activity, and the current Pulse
                        execution pipeline.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => loadJobs(true)}
                    disabled={refreshing}
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

            {error && (
                <section className="error-state analytics-error">
                    <AlertCircle size={20} />

                    <div>
                        <strong>
                            Analytics unavailable
                        </strong>

                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadJobs()}
                    >
                        Retry
                    </button>
                </section>
            )}

            {!error && (
                <>
                    <section
                        className="analytics-stat-grid"
                        aria-label="Workflow metrics"
                    >
                        <div className="analytics-stat-card">
                            <div className="analytics-stat-icon">
                                <Activity size={18} />
                            </div>

                            <div className="analytics-stat-content">
                                <span>Total Jobs</span>

                                <strong>
                                    {statistics.total}
                                </strong>

                                <small>
                                    All submitted workflows
                                </small>
                            </div>
                        </div>

                        <div className="analytics-stat-card">
                            <div className="analytics-stat-icon">
                                <CheckCircle2 size={18} />
                            </div>

                            <div className="analytics-stat-content">
                                <span>Success Rate</span>

                                <strong>
                                    {statistics.successRate}%
                                </strong>

                                <small>
                                    {statistics.completed} completed
                                    jobs
                                </small>
                            </div>
                        </div>

                        <div className="analytics-stat-card">
                            <div className="analytics-stat-icon">
                                <XCircle size={18} />
                            </div>

                            <div className="analytics-stat-content">
                                <span>Failure Rate</span>

                                <strong>
                                    {statistics.failureRate}%
                                </strong>

                                <small>
                                    {statistics.failed} failed jobs
                                </small>
                            </div>
                        </div>

                        <div className="analytics-stat-card">
                            <div className="analytics-stat-icon">
                                <Zap size={18} />
                            </div>

                            <div className="analytics-stat-content">
                                <span>Active Workload</span>

                                <strong>
                                    {statistics.active}
                                </strong>

                                <small>
                                    Pending + processing
                                </small>
                            </div>
                        </div>

                        <div className="analytics-stat-card">
                            <div className="analytics-stat-icon">
                                <RefreshCw size={18} />
                            </div>

                            <div className="analytics-stat-content">
                                <span>Retry Rate</span>

                                <strong>
                                    {statistics.retryRate}%
                                </strong>

                                <small>
                                    {statistics.retriedJobs} retried
                                    jobs
                                </small>
                            </div>
                        </div>

                        <div className="analytics-stat-card">
                            <div className="analytics-stat-icon">
                                <TrendingUp size={18} />
                            </div>

                            <div className="analytics-stat-content">
                                <span>Total Attempts</span>

                                <strong>
                                    {statistics.totalAttempts}
                                </strong>

                                <small>
                                    {statistics.averageAttempts} average
                                    per job
                                </small>
                            </div>
                        </div>
                    </section>

                    <section className="analytics-health-card">
                        <div className="analytics-health-header">
                            <div>
                                <span className="analytics-section-label">
                                    Workflow Health
                                </span>

                                <h2>
                                    Current processing overview
                                </h2>

                                <p>
                                    A real-time view of how submitted
                                    jobs are moving through Pulse.
                                </p>
                            </div>

                            <div className="analytics-health-rate">
                                <strong>
                                    {statistics.successRate}%
                                </strong>

                                <span>
                                    completion rate
                                </span>
                            </div>
                        </div>

                        <div className="analytics-health-progress">
                            <div
                                className="analytics-health-progress-fill"
                                style={{
                                    width: `${statistics.successRate}%`,
                                }}
                            />
                        </div>

                        <div className="analytics-health-meta">
                            <span>
                                <CheckCircle2 size={14} />
                                {statistics.completed} completed
                            </span>

                            <span>
                                <XCircle size={14} />
                                {statistics.failed} failed
                            </span>

                            <span>
                                <Activity size={14} />
                                {statistics.active} active
                            </span>

                            <span>
                                <RefreshCw size={14} />
                                {statistics.retriedJobs} retried
                            </span>
                        </div>
                    </section>

                    <section className="analytics-chart-grid">
                        <div className="analytics-card">
                            <div className="analytics-card-header">
                                <div>
                                    <span className="analytics-section-label">
                                        Distribution
                                    </span>

                                    <h2>Job Status</h2>

                                    <p>
                                        Current distribution of workflow
                                        states.
                                    </p>
                                </div>

                                <div className="analytics-card-total">
                                    <strong>
                                        {statistics.total}
                                    </strong>

                                    <span>Total</span>
                                </div>
                            </div>

                            {statusData.length === 0 ? (
                                <div className="analytics-empty">
                                    <Activity size={22} />

                                    <strong>
                                        No job data available
                                    </strong>

                                    <span>
                                        Create a job to populate analytics.
                                    </span>
                                </div>
                            ) : (
                                <div className="analytics-pie-container">
                                    <div className="analytics-pie-chart">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={96}
                                                    innerRadius={62}
                                                    paddingAngle={3}
                                                    strokeWidth={0}
                                                >
                                                    {statusData.map(
                                                        (entry) => (
                                                            <Cell
                                                                key={
                                                                    entry.name
                                                                }
                                                                fill={
                                                                    entry.name ===
                                                                    "Completed"
                                                                        ? "#22c55e"
                                                                        : entry.name ===
                                                                            "Failed"
                                                                          ? "#ef4444"
                                                                          : entry.name ===
                                                                              "Processing"
                                                                            ? "#6366f1"
                                                                            : "#f59e0b"
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>

                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        <div className="analytics-pie-center">
                                            <strong>
                                                {statistics.total}
                                            </strong>

                                            <span>
                                                jobs
                                            </span>
                                        </div>
                                    </div>

                                    <div className="analytics-legend">
                                        {statusData.map((item) => (
                                            <div
                                                className="analytics-legend-item"
                                                key={item.name}
                                            >
                                                <span
                                                    className={`analytics-legend-dot ${item.className}`}
                                                />

                                                <span>
                                                    {item.name}
                                                </span>

                                                <strong>
                                                    {item.value}
                                                </strong>

                                                <small>
                                                    {statistics.total > 0
                                                        ? Math.round(
                                                            (item.value /
                                                                statistics.total) *
                                                            100,
                                                        )
                                                        : 0}
                                                    %
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="analytics-card">
                            <div className="analytics-card-header">
                                <div>
                                    <span className="analytics-section-label">
                                        Reliability
                                    </span>

                                    <h2>Processing Attempts</h2>

                                    <p>
                                        Number of attempts required per
                                        job.
                                    </p>
                                </div>

                                <div className="analytics-card-total">
                                    <strong>
                                        {statistics.totalAttempts}
                                    </strong>

                                    <span>Attempts</span>
                                </div>
                            </div>

                            {attemptsData.length === 0 ? (
                                <div className="analytics-empty">
                                    <RefreshCw size={22} />

                                    <strong>
                                        No attempt data available
                                    </strong>

                                    <span>
                                        Processing data will appear here.
                                    </span>
                                </div>
                            ) : (
                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >
                                    <BarChart
                                        data={attemptsData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="attempts"
                                            label={{
                                                value: "Attempts",
                                                position:
                                                    "insideBottom",
                                                offset: -2,
                                            }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="jobs"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0,
                                            ]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <section className="analytics-card analytics-pipeline-card">
                        <div className="analytics-card-header">
                            <div>
                                <span className="analytics-section-label">
                                    Execution Flow
                                </span>

                                <h2>Processing Pipeline</h2>

                                <p>
                                    Current workload across the Pulse
                                    processing lifecycle.
                                </p>
                            </div>
                        </div>

                        <div className="pipeline-flow">
                            {pipelineStages.map(
                                (stage, index) => {
                                    const Icon = stage.icon;

                                    return (
                                        <div
                                            className="pipeline-flow-group"
                                            key={stage.label}
                                        >
                                            <div
                                                className={`pipeline-stage ${stage.className}`}
                                            >
                                                <div className="pipeline-stage-icon">
                                                    <Icon
                                                        size={18}
                                                    />
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
                                                pipelineStages.length -
                                                1 && (
                                                    <ArrowRight
                                                        size={18}
                                                        className="pipeline-arrow"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </section>

                    <section className="analytics-bottom-grid">
                        <div className="analytics-card analytics-recent-card">
                            <div className="analytics-card-header">
                                <div>
                                    <span className="analytics-section-label">
                                        Activity
                                    </span>

                                    <h2>Recent Jobs</h2>

                                    <p>
                                        The most recently updated
                                        workflows.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="analytics-text-button"
                                    onClick={() =>
                                        navigate("/jobs")
                                    }
                                >
                                    View all
                                    <ArrowRight size={15} />
                                </button>
                            </div>

                            {recentJobs.length === 0 ? (
                                <div className="analytics-empty">
                                    <Activity size={22} />

                                    <strong>
                                        No jobs created yet
                                    </strong>

                                    <span>
                                        Recent workflow activity will
                                        appear here.
                                    </span>
                                </div>
                            ) : (
                                <div className="analytics-activity-list">
                                    {recentJobs.map((job) => (
                                        <button
                                            type="button"
                                            className="analytics-activity-item"
                                            key={job.id}
                                            onClick={() =>
                                                navigate(
                                                    `/jobs/${job.id}`,
                                                )
                                            }
                                        >
                                            <div className="analytics-activity-icon">
                                                {job.status ===
                                                "COMPLETED" ? (
                                                    <CheckCircle2
                                                        size={17}
                                                    />
                                                ) : job.status ===
                                                "FAILED" ? (
                                                    <XCircle
                                                        size={17}
                                                    />
                                                ) : (
                                                    <Activity
                                                        size={17}
                                                    />
                                                )}
                                            </div>

                                            <div className="analytics-activity-main">
                                                <strong>
                                                    {job.name}
                                                </strong>

                                                <span>
                                                    Job #{job.id} ·{" "}
                                                    {new Date(
                                                        job.updatedAt,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="analytics-activity-meta">
                                                <span
                                                    className={`status-badge status-${job.status.toLowerCase()}`}
                                                >
                                                    {job.status}
                                                </span>

                                                <small>
                                                    {job.attemptCount}{" "}
                                                    {job.attemptCount ===
                                                    1
                                                        ? "attempt"
                                                        : "attempts"}
                                                </small>
                                            </div>

                                            <ArrowRight
                                                size={16}
                                                className="analytics-activity-arrow"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="analytics-card analytics-summary-card">
                            <div className="analytics-card-header">
                                <div>
                                    <span className="analytics-section-label">
                                        Operations
                                    </span>

                                    <h2>Pipeline Summary</h2>

                                    <p>
                                        Current processing state.
                                    </p>
                                </div>
                            </div>

                            <div className="pipeline-summary">
                                {pipelineStages.map((stage) => {
                                    const Icon = stage.icon;

                                    return (
                                        <div
                                            className={`pipeline-summary-item ${stage.className}`}
                                            key={stage.label}
                                        >
                                            <div className="pipeline-summary-icon">
                                                <Icon size={16} />
                                            </div>

                                            <div>
                                                <span>
                                                    {stage.label}
                                                </span>

                                                <small>
                                                    {
                                                        stage.description
                                                    }
                                                </small>
                                            </div>

                                            <strong>
                                                {stage.value}
                                            </strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

export default AnalyticsPage;

