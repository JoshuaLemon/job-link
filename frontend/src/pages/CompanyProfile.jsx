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
            // ✅ FIXED: Use by-company-id endpoint
            const response = await api.get(`/Company/by-company-id/${id}`);
            setCompany(response.data);
            
            // Load jobs for this company
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
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading company details...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <h4 className="text-danger">Company Not Found</h4>
                        <p className="text-muted">The company you're looking for doesn't exist.</p>
                        <Link to="/" className="btn btn-primary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Company Profile</h2>
                <Link to="/" className="btn btn-secondary">
                    ← Back to Jobs
                </Link>
            </div>

            <FeedbackMessage section="company" />

            <div className="card mb-4">
                <div className="card-body">
                    <h2 className="mb-2">{company.companyName}</h2>
                    
                    {company.industry && (
                        <p><strong>Industry:</strong> {company.industry}</p>
                    )}
                    {company.location && (
                        <p><strong>Location:</strong> {company.location}</p>
                    )}
                    {company.website && (
                        <p>
                            <strong>Website:</strong>{" "}
                            <a href={company.website} target="_blank" rel="noopener noreferrer">
                                {company.website}
                            </a>
                        </p>
                    )}
                    {company.description && (
                        <div className="mt-3">
                            <h5>About</h5>
                            <p>{company.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {jobs.length > 0 && (
                <div className="mt-4">
                    <h3 className="mb-3">Jobs at {company.companyName}</h3>
                    {jobs.map((job) => (
                        <div key={job.jobPostId} className="card mb-3">
                            <div className="card-body">
                                <h5>{job.title}</h5>
                                <p className="text-muted mb-1">
                                    <strong>📍</strong> {job.location}
                                </p>
                                <p className="text-muted mb-1">
                                    <strong>💰 Salary:</strong> ₱{job.salary.toLocaleString()}
                                </p>
                                <Link to={`/jobs/${job.jobPostId}`} className="btn btn-primary btn-sm">
                                    View Job
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