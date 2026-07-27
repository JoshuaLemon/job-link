import { Link } from "react-router-dom";

function JobCard({ job, isRecommended = false, compact = false }) {
    const tags = job.tags ? job.tags.split(',').map(t => t.trim()).filter(t => t) : [];

    if (compact) {
        return (
            <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                {isRecommended && (
                    <div className="card-header bg-primary text-white py-1 border-0">
                        <small>🎯 Recommended</small>
                    </div>
                )}
                <div className="card-body">
                    <h5 className="fw-bold mb-1">{job.title}</h5>
                    <p className="text-muted small mb-2">{job.companyName || "Company"}</p>
                    <p className="text-muted small mb-2">
                        <span className="me-2">📍</span> {job.location}
                    </p>
                    <div className="d-flex flex-wrap gap-1 mb-2">
                        {tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="badge bg-light text-dark small">
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="badge bg-light text-dark small">+{tags.length - 3}</span>
                        )}
                    </div>
                    <p className="fw-bold text-primary mb-2">
                        ₱{job.salary.toLocaleString()}
                    </p>
                    <small className="text-muted">
                        {Math.floor(Math.random() * 5) + 1} days ago
                    </small>
                    <Link to={`/jobs/${job.jobPostId}`} className="btn btn-outline-primary btn-sm w-100 mt-2">
                        View Details
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`card mb-3 ${isRecommended ? 'border-primary' : ''}`}>
            {isRecommended && (
                <div className="card-header bg-primary text-white py-1">
                    <small>🎯 Recommended for you</small>
                </div>
            )}
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h4>{job.title}</h4>
                        <p className="text-muted mb-2">
                            <strong>🏢</strong> {job.companyName || "Company"}
                        </p>
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