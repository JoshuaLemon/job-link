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
            <div className={`alert alert-${feedback.type} mt-3`} role="alert">
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
            "Full-time": "badge-primary",
            "Part-time": "badge-info",
            "Contract": "badge-warning",
            "Freelance": "badge-secondary",
            "Internship": "badge-success"
        };
        return typeMap[type] || "badge-default";
    };

    const getTags = (tags) => {
        if (!tags) return [];
        return tags.split(',').map(t => t.trim()).filter(t => t);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted-light mt-3">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h4 className="empty-state-title">Job Not Found</h4>
                    <p className="empty-state-text">The job you're looking for doesn't exist or has been removed.</p>
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
            <div className="page-header">
                <h2 className="page-title">Job Details</h2>
                <Link to="/" className="btn-back">
                    ← Back to Jobs
                </Link>
            </div>

            <FeedbackMessage section="job" />
            <FeedbackMessage section="apply" />

            <div className="details-card">
                <div className="details-card-body">
                    <div className="details-header">
                        <div>
                            <h2 className="details-title">{job.title}</h2>
                            {company ? (
                                <Link 
                                    to={`/company/${company.companyId}`} 
                                    className="company-link"
                                >
                                    🏢 {company.companyName}
                                </Link>
                            ) : (
                                <h6 className="details-company">
                                    {job.companyName || "Company"}
                                </h6>
                            )}
                        </div>
                        <span className={`badge ${getEmploymentBadgeClass(job.employmentType)}`}>
                            {job.employmentType}
                        </span>
                    </div>

                    {tags.length > 0 && (
                        <div className="details-tags">
                            {tags.map((tag, index) => (
                                <span key={index} className="tag">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="details-grid">
                        <div>
                            <strong>Location</strong>
                            <p>{job.location}</p>
                        </div>
                        <div>
                            <strong>Salary</strong>
                            <p>{formatSalary(job.salary)}</p>
                        </div>
                        <div>
                            <strong>Posted</strong>
                            <p>{new Date(job.postedAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="details-description">
                        <h5>Job Description</h5>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
                    </div>

                    <div className="apply-section">
                        {!user ? (
                            <Link to="/login" className="btn-primary btn-lg">
                                Login to Apply
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
                                    "Apply Now"
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

                    {hasApplied && (
                        <div className="alert-success mt-3">
                            <strong>✓ Application Submitted!</strong> You have already applied for this position. The employer will review your application.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobDetails;