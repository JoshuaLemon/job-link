import { Link } from "react-router-dom";

function JobCard({ job, isRecommended = false, compact = false }) {
    const tags = job.tags ? job.tags.split(',').map(t => t.trim()).filter(t => t) : [];

    if (compact) {
        return (
            <div className="job-card">
                {isRecommended && (
                    <div className="job-card-recommended-badge">🎯 Recommended</div>
                )}
                <div className="job-card-body">
                    <h4 className="job-card-title">{job.title}</h4>
                    <p className="job-card-company">{job.companyName || "Company"}</p>
                    <p className="job-card-location">
                        <span className="location-icon">📍</span> {job.location}
                    </p>
                    
                    {tags.length > 0 && (
                        <div className="job-card-tags">
                            {tags.slice(0, 4).map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                            ))}
                            {tags.length > 4 && (
                                <span className="tag tag-more">+{tags.length - 4}</span>
                            )}
                        </div>
                    )}

                    <div className="job-card-footer">
                        <span className="job-card-salary">₱{job.salary.toLocaleString()}</span>
                        <span className="job-card-time">{Math.floor(Math.random() * 5) + 1} days ago</span>
                    </div>

                    <Link to={`/jobs/${job.jobPostId}`} className="job-card-btn">
                        View Details →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`job-card ${isRecommended ? 'job-card-recommended' : ''}`}>
            {isRecommended && (
                <div className="job-card-recommended-badge">🎯 Recommended for you</div>
            )}
            <div className="job-card-body">
                <div className="job-card-header">
                    <div>
                        <h4 className="job-card-title">{job.title}</h4>
                        <p className="job-card-company">🏢 {job.companyName || "Company"}</p>
                    </div>
                    <span className="job-card-type">{job.employmentType}</span>
                </div>

                <p className="job-card-location">
                    <span className="location-icon">📍</span> {job.location}
                </p>

                {tags.length > 0 && (
                    <div className="job-card-tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}

                <div className="job-card-footer">
                    <span className="job-card-salary">₱{job.salary.toLocaleString()}</span>
                    <span className="job-card-time">{Math.floor(Math.random() * 5) + 1} days ago</span>
                </div>

                <Link to={`/jobs/${job.jobPostId}`} className="job-card-btn">
                    View Details →
                </Link>
            </div>
        </div>
    );
}

export default JobCard;