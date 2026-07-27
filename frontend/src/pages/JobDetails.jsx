import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function JobDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

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
            <div className={`alert alert-${feedback.type}`} role="alert">
                {feedback.message}
            </div>
        );
    };

    useEffect(() => {
        loadJob();
        checkApplicationStatus();
    }, [id]);

    const loadJob = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/JobPost/${id}`);
            console.log("Job data:", response.data);
            setJob(response.data);
            
            if (response.data.companyId) {
                try {
                    const companyResponse = await api.get(`/Company/by-company-id/${response.data.companyId}`);
                    console.log("Company data:", companyResponse.data);
                    setCompany(companyResponse.data);
                } catch (err) {
                    console.error("Failed to load company details:", err);
                }
            }
        } catch (error) {
            console.error(error);
            showFeedback("job", "danger", "Failed to load job details.");
        } finally {
            setLoading(false);
        }
    };

    const checkApplicationStatus = async () => {
        if (!user) return;
        
        try {
            const response = await api.get("/Application/my-applications");
            const applications = response.data || [];
            const existing = applications.find(app => app.jobPostId === parseInt(id));
            if (existing) {
                setHasApplied(true);
            }
        } catch (error) {
            console.error("Error checking application status:", error);
        }
    };

    const handleApply = async () => {
        if (!user) {
            showFeedback("apply", "warning", "Please login to apply for this job.");
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        if (user.role === "Employer") {
            showFeedback("apply", "warning", "Employers cannot apply for jobs.");
            return;
        }

        setApplying(true);
        try {
            await api.post("/Application", {
                jobPostId: job.jobPostId
            });
            setHasApplied(true);
            showFeedback("apply", "success", "Application submitted successfully!");
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data || "Unable to apply. Please try again.";
            showFeedback("apply", "danger", errorMessage);
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (salary) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(salary);
    };

    const getEmploymentBadgeClass = (type) => {
        const typeMap = {
            "Full-time": "badge-fulltime",
            "Part-time": "badge-parttime",
            "Contract": "badge-contract",
            "Freelance": "badge-other",
            "Internship": "badge-internship"
        };
        return typeMap[type] || "badge-other";
    };

    const getTags = (tags) => {
        if (!tags) return [];
        return tags.split(',').map(t => t.trim()).filter(t => t);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p className="text-muted-light">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="page-container">
                <div className="empty-state-large">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                    <h4>Job Not Found</h4>
                    <p className="text-muted-light">The job you're looking for doesn't exist or has been removed.</p>
                    <Link to="/" className="btn-primary">
                        Browse Jobs
                    </Link>
                </div>
            </div>
        );
    }

    const tags = getTags(job.tags);

    return (
        <div className="page-container">
            <Link to="/" className="btn-back" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                ← Back to Jobs
            </Link>

            <FeedbackMessage section="job" />
            <FeedbackMessage section="apply" />

            <div className="job-details-modern">
                {/* Header Section */}
                <div className="job-details-header">
                    <div className="job-details-title-section">
                        <h1 className="job-details-title">{job.title}</h1>
                        {company ? (
                            <Link 
                                to={`/company/${company.companyId}`} 
                                className="job-details-company"
                            >
                                🏢 {company.companyName}
                            </Link>
                        ) : (
                            <span className="job-details-company">
                                🏢 {job.companyName || "Company"}
                            </span>
                        )}
                    </div>
                    <span className={`employment-badge ${getEmploymentBadgeClass(job.employmentType)}`}>
                        {job.employmentType}
                    </span>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="job-details-tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="job-tag">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Quick Info Grid */}
                <div className="job-details-info-grid">
                    <div className="info-item">
                        <span className="info-icon">📍</span>
                        <div>
                            <span className="info-label">Location</span>
                            <span className="info-value">{job.location}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">💰</span>
                        <div>
                            <span className="info-label">Salary</span>
                            <span className="info-value">{formatSalary(job.salary)}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📅</span>
                        <div>
                            <span className="info-label">Posted</span>
                            <span className="info-value">{new Date(job.postedAt || Date.now()).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">👤</span>
                        <div>
                            <span className="info-label">Employment Type</span>
                            <span className="info-value">{job.employmentType}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="job-details-description">
                    <h3>📋 Job Description</h3>
                    <p>{job.description}</p>
                </div>

                {/* Apply Section */}
                <div className="job-details-apply">
                    <div className="apply-content">
                        <div className="apply-text">
                            <h4>Ready to apply?</h4>
                            <p className="text-muted-light">Join {company?.companyName || 'this company'} and be part of their team.</p>
                        </div>
                        <div className="apply-buttons">
                            {!user ? (
                                <Link to="/login" className="btn-primary btn-lg">
                                    🔑 Login to Apply
                                </Link>
                            ) : hasApplied ? (
                                <button className="btn-success btn-lg" disabled>
                                    ✅ Already Applied
                                </button>
                            ) : user.role === "Employee" ? (
                                <button
                                    className="btn-success btn-lg"
                                    onClick={handleApply}
                                    disabled={applying}
                                >
                                    {applying ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Applying...
                                        </>
                                    ) : (
                                        "📝 Apply Now"
                                    )}
                                </button>
                            ) : (
                                <button className="btn-secondary btn-lg" disabled>
                                    Employers cannot apply
                                </button>
                            )}
                            <Link to="/" className="btn-outline">
                                Browse More Jobs
                            </Link>
                        </div>
                    </div>
                    {hasApplied && (
                        <div className="alert-success" style={{ marginTop: '1rem' }}>
                            ✅ <strong>Application Submitted!</strong> You have already applied for this position. The employer will review your application.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobDetails;