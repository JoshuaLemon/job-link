import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function CompanyProfile() {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);

    const [feedback, setFeedback] = useState({
        section: "",
        type: "",
        message: ""
    });

    const USE_INLINE_FEEDBACK = true;

    const showFeedback = (section, type, message) => {
        if (USE_INLINE_FEEDBACK) {
            setFeedback({
                section,
                type,
                message
            });
            setTimeout(() => {
                setFeedback({
                    section: "",
                    type: "",
                    message: ""
                });
            }, 3000);
        } else {
            alert(message);
        }
    };

    const FeedbackMessage = ({ section }) => {
        if (feedback.section !== section || !feedback.message) {
            return null;
        }
        return (
            <div className={`alert alert-${feedback.type} mt-3`} role="alert">
                {feedback.message}
            </div>
        );
    };

    useEffect(() => {
        loadCompany();
    }, [id]);

    const loadCompany = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/Company/by-company-id/${id}`);
            setCompany(response.data);
            
            try {
                const jobsResponse = await api.get(`/JobPost?companyId=${id}`);
                setJobs(jobsResponse.data.data || []);
            } catch (err) {
                console.error("Failed to load company jobs:", err);
            }
        } catch (error) {
            console.error(error);
            showFeedback("company", "danger", "Failed to load company details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted-light mt-3">Loading company details...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h4 className="empty-state-title">Company Not Found</h4>
                    <p className="empty-state-text">The company you're looking for doesn't exist.</p>
                    <Link to="/" className="btn-primary-custom">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Company Profile</h2>
                <Link to="/" className="btn-back">
                    ← Back to Jobs
                </Link>
            </div>

            <FeedbackMessage section="company" />

            <div className="company-card">
                <div className="company-card-body">
                    <h2 className="company-name">{company.companyName}</h2>
                    
                    <div className="company-details">
                        {company.industry && (
                            <p className="company-detail">
                                <strong>Industry:</strong> {company.industry}
                            </p>
                        )}
                        {company.location && (
                            <p className="company-detail">
                                <strong>Location:</strong> {company.location}
                            </p>
                        )}
                        {company.website && (
                            <p className="company-detail">
                                <strong>Website:</strong>{" "}
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="company-link">
                                    {company.website}
                                </a>
                            </p>
                        )}
                    </div>

                    {company.description && (
                        <div className="company-about">
                            <h5 className="company-about-title">About</h5>
                            <p className="company-about-text">{company.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {jobs.length > 0 && (
                <div className="mt-4">
                    <h3 className="jobs-title">Jobs at {company.companyName}</h3>
                    {jobs.map((job) => (
                        <div key={job.jobPostId} className="job-item">
                            <div className="job-item-body">
                                <h5 className="job-item-title">{job.title}</h5>
                                <p className="job-item-location">
                                    <span className="location-icon">📍</span> {job.location}
                                </p>
                                <p className="job-item-salary">
                                    <strong>💰 Salary:</strong> ₱{job.salary.toLocaleString()}
                                </p>
                                <Link to={`/jobs/${job.jobPostId}`} className="job-item-btn">
                                    View Job →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CompanyProfile;