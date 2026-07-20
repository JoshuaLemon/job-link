import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function JobDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
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
            setJob(response.data);
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
            // Check if user has already applied
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
            "Full-time": "bg-primary",
            "Part-time": "bg-info text-dark",
            "Contract": "bg-warning text-dark",
            "Freelance": "bg-secondary",
            "Internship": "bg-success"
        };
        return typeMap[type] || "bg-light text-dark";
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <h4 className="text-danger">Job Not Found</h4>
                        <p className="text-muted">The job you're looking for doesn't exist or has been removed.</p>
                        <Link to="/" className="btn btn-primary">
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Job Details</h2>
                <Link to="/" className="btn btn-secondary">
                    ← Back to Jobs
                </Link>
            </div>

            <FeedbackMessage section="job" />
            <FeedbackMessage section="apply" />

            {/* Job Details Card */}
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h2 className="mb-2">{job.title}</h2>
                            <h6 className="text-muted">
                                {job.companyName || "Company"}
                            </h6>
                        </div>
                        <span className={`badge fs-6 px-3 py-2 ${getEmploymentBadgeClass(job.employmentType)}`}>
                            {job.employmentType}
                        </span>
                    </div>

                    {/* Job Meta Info */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-2">
                            <strong>Location</strong>
                            <p className="mb-0">{job.location}</p>
                        </div>
                        <div className="col-md-4 mb-2">
                            <strong>Salary</strong>
                            <p className="mb-0">{formatSalary(job.salary)}</p>
                        </div>
                        <div className="col-md-4 mb-2">
                            <strong>Posted</strong>
                            <p className="mb-0">{new Date(job.postedAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <h5>Job Description</h5>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
                    </div>

                    {/* Apply Button */}
                    <div className="d-flex gap-3 flex-wrap">
                        {!user ? (
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Login to Apply
                            </Link>
                        ) : hasApplied ? (
                            <button className="btn btn-success btn-lg" disabled>
                                ✅ Already Applied
                            </button>
                        ) : user.role === "Employee" ? (
                            <button
                                className="btn btn-success btn-lg"
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
                            <button className="btn btn-secondary btn-lg" disabled>
                                Employers cannot apply
                            </button>
                        )}
                        
                        <Link to="/" className="btn btn-outline-secondary btn-lg">
                            Browse More Jobs
                        </Link>
                    </div>

                    {/* Application Status Message */}
                    {hasApplied && (
                        <div className="mt-3">
                            <div className="alert alert-success">
                                <strong>✓ Application Submitted!</strong> You have already applied for this position. The employer will review your application.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobDetails;