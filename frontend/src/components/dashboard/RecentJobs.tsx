import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { Job } from "../../types/job";

interface RecentJobsProps {
    jobs: Job[];
}

function RecentJobs({ jobs }: RecentJobsProps) {
    return (
        <section className="dashboard-card recent-jobs-card">
            <div className="dashboard-card-header">
                <div>
                    <h2>Recent jobs</h2>
                    <p>Latest workflow activity</p>
                </div>

                <Link
                    to="/jobs"
                    className="view-all-link"
                >
                    View all
                    <ArrowRight size={15} />
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <p>No jobs have been created yet.</p>
                </div>
            ) : (
                <div className="recent-jobs-list">
                    {jobs.slice(0, 5).map((job) => (
                        <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="recent-job-row"
                        >
                            <div className="recent-job-main">
                <span className="recent-job-name">
                  {job.name}
                </span>

                                <span className="recent-job-id">
                  Job #{job.id}
                </span>
                            </div>

                            <span
                                className={`job-status-badge ${job.status.toLowerCase()}`}
                            >
                {job.status}
              </span>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

export default RecentJobs;