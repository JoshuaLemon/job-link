import { Link } from "react-router-dom";

function JobCard({ job }) {
    const tags = job.tags ? job.tags.split(',').map(t => t.trim()).filter(t => t) : [];

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h4>{job.title}</h4>
                        <p className="text-muted mb-2">
                            <strong>📍</strong> {job.location}
                        </p>
                        <p className="text-muted mb-2">
                            <strong>💰 Salary:</strong> ₱{job.salary.toLocaleString()}
                        </p>
                        <p className="text-muted mb-2">
                            <strong>📋 Type:</strong> {job.employmentType}
                        </p>
                    </div>
                    <span className={`badge fs-6 px-3 py-2 bg-${job.employmentType === 'Full-time' ? 'primary' : job.employmentType === 'Part-time' ? 'info' : job.employmentType === 'Contract' ? 'warning' : 'secondary'}`}>
                        {job.employmentType}
                    </span>
                </div>

                {tags.length > 0 && (
                    <div className="mt-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="badge bg-secondary me-1 px-2 py-1">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-3">
                    <Link to={`/jobs/${job.jobPostId}`} className="btn btn-primary">
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default JobCard;