import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getJobs } from "../services/jobService";
import type { Job } from "../types/job";

function FailedJobsPage() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [search, setSearch] = useState("");
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
            console.error("Failed to load jobs:", err);

            setError(
                "Unable to load failed jobs. Please check that the Pulse API is running.",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadJobs();
    }, []);

    const failedJobs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return jobs
            .filter((job) => job.status === "FAILED")
            .filter((job) => {
                if (!query) {
                    return true;
                }

                return (
                    job.name.toLowerCase().includes(query) ||
                    String(job.id).includes(query)
                );
            })
            .sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
            );
    }, [jobs, search]);

    const failedCount = jobs.filter(
        (job) => job.status === "FAILED",
    ).length;

    const totalAttempts = jobs
        .filter((job) => job.status === "FAILED")
        .reduce(
            (total, job) => total + job.attemptCount,
            0,
        );

    if (loading) {
        return (
            <main className="page-content">
                <div className="page-header">
                    <div>
                        <div className="skeleton skeleton-title" />
                        <div className="skeleton skeleton-subtitle" />
                    </div>
                </div>

                <section className="stats-grid">
                    <div className="skeleton skeleton-card" />
                    <div className="skeleton skeleton-card" />
                </section>

                <section className="jobs-card">
                    <div className="skeleton skeleton-table" />
                </section>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="page-header">
                <div>
          <span className="page-eyebrow">
            Reliability
          </span>

                    <h1>Failed Jobs</h1>

                    <p className="page-description">
                        Monitor jobs that failed during processing and
                        inspect their execution history.
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

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Failed Jobs</span>

                        <AlertCircle size={18} />
                    </div>

                    <strong>{failedCount}</strong>

                    <small>
                        Jobs currently marked as failed
                    </small>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Total Attempts</span>

                        <AlertCircle size={18} />
                    </div>

                    <strong>{totalAttempts}</strong>

                    <small>
                        Processing attempts across failed jobs
                    </small>
                </div>
            </section>

            {error && (
                <section className="error-state">
                    <AlertCircle size={20} />

                    <div>
                        <strong>Unable to load failed jobs</strong>

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
                <section className="jobs-card">
                    <div className="jobs-card-header">
                        <div>
                            <h2>Failed job queue</h2>

                            <p>
                                {failedJobs.length}{" "}
                                {failedJobs.length === 1
                                    ? "job"
                                    : "jobs"}{" "}
                                found
                            </p>
                        </div>

                        <div className="jobs-search">
                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Search failed jobs..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    {failedJobs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <AlertCircle size={24} />
                            </div>

                            <h3>
                                {search
                                    ? "No matching failed jobs"
                                    : "No failed jobs"}
                            </h3>

                            <p>
                                {search
                                    ? "Try a different search term."
                                    : "All processed jobs are currently healthy."}
                            </p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="jobs-table">
                                <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Job</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Attempts</th>
                                    <th scope="col">Last Updated</th>
                                </tr>
                                </thead>

                                <tbody>
                                {failedJobs.map((job) => (
                                    <tr
                                        key={job.id}
                                        onClick={() =>
                                            navigate(`/jobs/${job.id}`)
                                        }
                                        className="clickable-row"
                                    >
                                        <td>
                        <span className="job-id">
                          #{job.id}
                        </span>
                                        </td>

                                        <td>
                                            <div className="job-name-cell">
                                                <strong>{job.name}</strong>

                                                <span>
                            Created{" "}
                                                    {new Date(
                                                        job.createdAt,
                                                    ).toLocaleString()}
                          </span>
                                            </div>
                                        </td>

                                        <td>
                        <span className="status-badge status-failed">
                          FAILED
                        </span>
                                        </td>

                                        <td>
                        <span className="attempt-count">
                          {job.attemptCount}
                        </span>
                                        </td>

                                        <td>
                                            {new Date(
                                                job.updatedAt,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

export default FailedJobsPage;