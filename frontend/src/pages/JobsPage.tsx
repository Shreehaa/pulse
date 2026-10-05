import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    ArrowUpDown,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    Plus,
    RefreshCw,
    Search,
    X,
    XCircle,
} from "lucide-react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    createJob,
    getJobs,
} from "../services/jobService";

import type {
    Job,
    JobStatus,
} from "../types/job";

type SortOption =
    | "created-desc"
    | "created-asc"
    | "name-asc"
    | "name-desc"
    | "status"
    | "attempts-desc"
    | "attempts-asc";

function JobsPage() {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] =
        useSearchParams();

    const [jobs, setJobs] =
        useState<Job[]>([]);

    const [search, setSearch] =
        useState(
            searchParams.get("search") || "",
        );

    const [statusFilter, setStatusFilter] =
        useState<
            "ALL" | JobStatus
        >("ALL");

    const [sortOption, setSortOption] =
        useState<SortOption>(
            "created-desc",
        );

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [jobName, setJobName] =
        useState("");

    const [createError, setCreateError] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [createSuccess, setCreateSuccess] =
        useState("");

    async function loadJobs(
        isRefresh = false,
    ) {
        try {
            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data =
                await getJobs();

            setJobs(data);
        } catch (err) {
            console.error(
                "Failed to load jobs:",
                err,
            );

            setError(
                "Unable to load jobs. Please check that the Pulse API is running.",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        const urlSearch =
            searchParams.get("search") || "";

        setSearch(urlSearch);
    }, [searchParams]);

    function handleSearchChange(
        value: string,
    ) {
        setSearch(value);

        const trimmedValue =
            value.trim();

        if (trimmedValue) {
            setSearchParams(
                {
                    search: trimmedValue,
                },
                {
                    replace: true,
                },
            );
        } else {
            setSearchParams(
                {},
                {
                    replace: true,
                },
            );
        }
    }

    function clearSearch() {
        setSearch("");

        setSearchParams(
            {},
            {
                replace: true,
            },
        );
    }

    function openCreateModal() {
        setJobName("");
        setCreateError("");
        setCreateSuccess("");
        setShowCreateModal(true);
    }

    function closeCreateModal() {
        if (creating) {
            return;
        }

        setShowCreateModal(false);
        setJobName("");
        setCreateError("");
        setCreateSuccess("");
    }

    async function handleCreateJob(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedName =
            jobName.trim();

        if (!trimmedName) {
            setCreateError(
                "Job name is required.",
            );
            return;
        }

        if (trimmedName.length < 3) {
            setCreateError(
                "Job name must contain at least 3 characters.",
            );
            return;
        }

        if (trimmedName.length > 100) {
            setCreateError(
                "Job name must contain no more than 100 characters.",
            );
            return;
        }

        try {
            setCreating(true);
            setCreateError("");
            setCreateSuccess("");

            const createdJob =
                await createJob(
                    trimmedName,
                );

            setJobs(
                (currentJobs) => [
                    createdJob,
                    ...currentJobs,
                ],
            );

            setCreateSuccess(
                `Job #${createdJob.id} was created successfully.`,
            );

            setJobName("");

            window.setTimeout(() => {
                setShowCreateModal(false);
                setCreateSuccess("");
            }, 900);
        } catch (err) {
            console.error(
                "Failed to create job:",
                err,
            );

            if (
                typeof err === "object" &&
                err !== null &&
                "response" in err
            ) {
                const axiosError =
                    err as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    };

                setCreateError(
                    axiosError.response
                        ?.data
                        ?.message ||
                    "Unable to create the job. Please try again.",
                );
            } else {
                setCreateError(
                    "Unable to create the job. Please try again.",
                );
            }
        } finally {
            setCreating(false);
        }
    }

    const filteredJobs =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            const result =
                jobs
                    .filter((job) => {
                        if (
                            statusFilter ===
                            "ALL"
                        ) {
                            return true;
                        }

                        return (
                            job.status ===
                            statusFilter
                        );
                    })
                    .filter((job) => {
                        if (!query) {
                            return true;
                        }

                        return (
                            job.name
                                .toLowerCase()
                                .includes(
                                    query,
                                ) ||
                            String(job.id).includes(
                                query,
                            ) ||
                            job.status
                                .toLowerCase()
                                .includes(
                                    query,
                                )
                        );
                    });

            return [
                ...result,
            ].sort(
                (a, b) => {
                    switch (
                        sortOption
                        ) {
                        case "created-asc":
                            return (
                                new Date(
                                    a.createdAt,
                                ).getTime() -
                                new Date(
                                    b.createdAt,
                                ).getTime()
                            );

                        case "name-asc":
                            return a.name.localeCompare(
                                b.name,
                            );

                        case "name-desc":
                            return b.name.localeCompare(
                                a.name,
                            );

                        case "status":
                            return a.status.localeCompare(
                                b.status,
                            );

                        case "attempts-desc":
                            return (
                                b.attemptCount -
                                a.attemptCount
                            );

                        case "attempts-asc":
                            return (
                                a.attemptCount -
                                b.attemptCount
                            );

                        case "created-desc":
                        default:
                            return (
                                new Date(
                                    b.createdAt,
                                ).getTime() -
                                new Date(
                                    a.createdAt,
                                ).getTime()
                            );
                    }
                },
            );
        }, [
            jobs,
            search,
            statusFilter,
            sortOption,
        ]);

    function openJob(jobId: number) {
        navigate(
            `/jobs/${jobId}`,
        );
    }

    function handleJobKeyDown(
        event: React.KeyboardEvent<HTMLTableRowElement>,
        jobId: number,
    ) {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            openJob(jobId);
        }
    }

    function getStatusIcon(
        status: JobStatus,
    ) {
        switch (status) {
            case "COMPLETED":
                return (
                    <CheckCircle2
                        size={14}
                    />
                );

            case "FAILED":
                return (
                    <XCircle
                        size={14}
                    />
                );

            case "PROCESSING":
                return (
                    <LoaderCircle
                        size={14}
                        className="status-icon-spin"
                    />
                );

            case "PENDING":
            default:
                return (
                    <Clock3
                        size={14}
                    />
                );
        }
    }

    function formatStatus(
        status: JobStatus,
    ) {
        return (
            status.charAt(0) +
            status
                .slice(1)
                .toLowerCase()
        );
    }

    if (loading) {
        return (
            <main className="page-content">
                <div className="jobs-loading-page">
                    <div className="jobs-loading-heading">
                        <div>
                            <div className="skeleton skeleton-eyebrow" />

                            <div className="skeleton skeleton-title" />

                            <div className="skeleton skeleton-subtitle" />
                        </div>

                        <div className="jobs-loading-actions">
                            <div className="skeleton skeleton-button" />
                            <div className="skeleton skeleton-button skeleton-button-wide" />
                        </div>
                    </div>

                    <section className="jobs-loading">
                        <div className="jobs-loading-toolbar">
                            <div className="skeleton skeleton-search" />
                            <div className="skeleton skeleton-filter" />
                            <div className="skeleton skeleton-filter" />
                        </div>

                        {Array.from({
                            length: 6,
                        }).map(
                            (_, index) => (
                                <div
                                    key={
                                        index
                                    }
                                    className="jobs-loading-row"
                                >
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            ),
                        )}
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="page-header jobs-page-header">
                <div>
                    <span className="page-eyebrow">
                        Workflow Operations
                    </span>

                    <h1>
                        Jobs
                    </h1>

                    <p className="page-description">
                        Create, monitor, and
                        inspect asynchronous
                        workflow jobs processed
                        by Pulse.
                    </p>
                </div>

                <div className="jobs-page-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            loadJobs(true)
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

                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        <Plus
                            size={17}
                        />

                        Create Job
                    </button>
                </div>
            </div>

            {error && (
                <section
                    className="error-state"
                    role="alert"
                >
                    <AlertCircle
                        size={20}
                    />

                    <div>
                        <strong>
                            Unable to load jobs
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadJobs()
                        }
                    >
                        Retry
                    </button>
                </section>
            )}

            {!error && (
                <section className="jobs-card">
                    <div className="jobs-card-header">
                        <div className="jobs-card-title">
                            <div>
                                <h2>
                                    All Jobs
                                </h2>

                                <p>
                                    {
                                        filteredJobs.length
                                    }{" "}
                                    {filteredJobs.length ===
                                    1
                                        ? "job"
                                        : "jobs"}{" "}
                                    shown
                                </p>
                            </div>

                            <span className="jobs-result-count">
                                {filteredJobs.length}
                            </span>
                        </div>

                        <div className="jobs-toolbar">
                            <div className="jobs-search">
                                <Search
                                    size={17}
                                />

                                <input
                                    type="search"
                                    placeholder="Search by name, ID or status..."
                                    value={
                                        search
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        handleSearchChange(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    aria-label="Search jobs"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        className="jobs-search-clear"
                                        onClick={
                                            clearSearch
                                        }
                                        aria-label="Clear job search"
                                    >
                                        <X
                                            size={
                                                14
                                            }
                                        />
                                    </button>
                                )}
                            </div>

                            <label className="jobs-select-control">
                                <span>
                                    Status
                                </span>

                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setStatusFilter(
                                            event
                                                .target
                                                .value as
                                                | "ALL"
                                                | JobStatus,
                                        )
                                    }
                                    aria-label="Filter jobs by status"
                                >
                                    <option value="ALL">
                                        All statuses
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="PROCESSING">
                                        Processing
                                    </option>

                                    <option value="COMPLETED">
                                        Completed
                                    </option>

                                    <option value="FAILED">
                                        Failed
                                    </option>
                                </select>
                            </label>

                            <label className="jobs-select-control">
                                <span>
                                    Sort
                                </span>

                                <div className="jobs-sort-control">
                                    <ArrowUpDown
                                        size={14}
                                    />

                                    <select
                                        value={
                                            sortOption
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setSortOption(
                                                event
                                                    .target
                                                    .value as SortOption,
                                            )
                                        }
                                        aria-label="Sort jobs"
                                    >
                                        <option value="created-desc">
                                            Newest
                                        </option>

                                        <option value="created-asc">
                                            Oldest
                                        </option>

                                        <option value="name-asc">
                                            Name A → Z
                                        </option>

                                        <option value="name-desc">
                                            Name Z → A
                                        </option>

                                        <option value="status">
                                            Status
                                        </option>

                                        <option value="attempts-desc">
                                            Attempts ↓
                                        </option>

                                        <option value="attempts-asc">
                                            Attempts ↑
                                        </option>
                                    </select>
                                </div>
                            </label>
                        </div>
                    </div>

                    {filteredJobs.length ===
                    0 ? (
                        <div className="empty-state jobs-empty-state">
                            <div className="empty-state-icon">
                                <Search
                                    size={24}
                                />
                            </div>

                            <h3>
                                {search ||
                                statusFilter !==
                                "ALL"
                                    ? "No matching jobs"
                                    : "No jobs yet"}
                            </h3>

                            <p>
                                {search ||
                                statusFilter !==
                                "ALL"
                                    ? "Try changing your search or filters."
                                    : "Create your first job to start processing work through Pulse."}
                            </p>

                            {!search &&
                                statusFilter ===
                                "ALL" && (
                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={
                                            openCreateModal
                                        }
                                    >
                                        <Plus
                                            size={
                                                16
                                            }
                                        />

                                        Create Job
                                    </button>
                                )}
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="jobs-table">
                                <caption className="sr-only">
                                    Pulse workflow jobs
                                </caption>

                                <thead>
                                <tr>
                                    <th scope="col">
                                        ID
                                    </th>

                                    <th scope="col">
                                        Job
                                    </th>

                                    <th scope="col">
                                        Status
                                    </th>

                                    <th scope="col">
                                        Attempts
                                    </th>

                                    <th scope="col">
                                        Created
                                    </th>

                                    <th
                                        scope="col"
                                        className="jobs-table-action-heading"
                                    >
                                        <span className="sr-only">
                                            Open
                                        </span>
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredJobs.map(
                                    (
                                        job,
                                    ) => (
                                        <tr
                                            key={
                                                job.id
                                            }
                                            onClick={() =>
                                                openJob(
                                                    job.id,
                                                )
                                            }
                                            onKeyDown={(
                                                event,
                                            ) =>
                                                handleJobKeyDown(
                                                    event,
                                                    job.id,
                                                )
                                            }
                                            className="job-row clickable-row"
                                            tabIndex={
                                                0
                                            }
                                            aria-label={`Open job ${job.name}, ID ${job.id}, status ${formatStatus(job.status)}`}
                                        >
                                            <td>
                                                <span className="job-id">
                                                    #
                                                    {
                                                        job.id
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <div className="job-name-cell">
                                                    <strong>
                                                        {
                                                            job.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        Updated{" "}
                                                        {new Date(
                                                            job.updatedAt,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`job-status job-status-${job.status.toLowerCase()}`}
                                                >
                                                    <span className="job-status-dot">
                                                        {getStatusIcon(
                                                            job.status,
                                                        )}
                                                    </span>

                                                    <span>
                                                        {
                                                            formatStatus(
                                                                job.status,
                                                            )
                                                        }
                                                    </span>
                                                </span>
                                            </td>

                                            <td>
                                                <span className="job-attempts">
                                                    {
                                                        job.attemptCount
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span className="job-date">
                                                    {new Date(
                                                        job.createdAt,
                                                    ).toLocaleString()}
                                                </span>
                                            </td>

                                            <td className="jobs-table-action">
                                                <span className="job-open-button">
                                                    →
                                                </span>
                                            </td>
                                        </tr>
                                    ),
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {showCreateModal && (
                <div
                    className="modal-backdrop"
                    onMouseDown={(
                        event,
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreateModal();
                        }
                    }}
                >
                    <section
                        className="create-job-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-job-title"
                    >
                        <div className="create-job-modal-header">
                            <div>
                                <span className="page-eyebrow">
                                    New Workflow
                                </span>

                                <h2 id="create-job-title">
                                    Create Job
                                </h2>

                                <p>
                                    Submit a new
                                    asynchronous
                                    job to the
                                    Pulse
                                    processing
                                    pipeline.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeCreateModal
                                }
                                disabled={
                                    creating
                                }
                                aria-label="Close create job dialog"
                            >
                                <X
                                    size={18}
                                />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleCreateJob
                            }
                            className="create-job-form"
                        >
                            <label htmlFor="job-name">
                                Job name
                            </label>

                            <input
                                id="job-name"
                                type="text"
                                value={
                                    jobName
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setJobName(
                                        event
                                            .target
                                            .value,
                                    );

                                    setCreateError(
                                        "",
                                    );

                                    setCreateSuccess(
                                        "",
                                    );
                                }}
                                placeholder="e.g. generate-monthly-report"
                                autoFocus
                                disabled={
                                    creating
                                }
                                maxLength={
                                    100
                                }
                            />

                            <div className="create-job-form-meta">
                                <span>
                                    Use a
                                    descriptive
                                    name for
                                    this
                                    workflow.
                                </span>

                                <span>
                                    {
                                        jobName.length
                                    }
                                    /100
                                </span>
                            </div>

                            {createError && (
                                <div
                                    className="form-error"
                                    role="alert"
                                >
                                    <AlertCircle
                                        size={
                                            16
                                        }
                                    />

                                    <span>
                                        {
                                            createError
                                        }
                                    </span>
                                </div>
                            )}

                            {createSuccess && (
                                <div
                                    className="form-success"
                                    role="status"
                                >
                                    <CheckCircle2
                                        size={16}
                                    />

                                    <span>
                                        {
                                            createSuccess
                                        }
                                    </span>
                                </div>
                            )}

                            <div className="create-job-modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={
                                        creating
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        creating
                                    }
                                >
                                    {creating ? (
                                        <>
                                            <RefreshCw
                                                size={
                                                    16
                                                }
                                                className="spin-animation"
                                            />

                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus
                                                size={
                                                    16
                                                }
                                            />

                                            Create Job
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default JobsPage;