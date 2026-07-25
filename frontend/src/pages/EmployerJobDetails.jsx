import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import TalentCard from "../components/TalentCard";

function EmployerJobDetails() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [talents, setTalents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTalents, setLoadingTalents] = useState(false);
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
        if (user?.role === "Employer") {
            loadTalents();
        }
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

    const loadTalents = async () => {
        setLoadingTalents(true);
        try {
            const response = await api.get(`/JobPost/${id}/talents?limit=10`);
            setTalents(response.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTalents(false);
        }
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
                        <Link to="/employer" className="btn btn-primary">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const tags = job.tags ? job.tags.split(',').map(t => t.trim()).filter(t => t) : [];

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Job Details</h2>
                <Link to="/employer" className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="job" />

            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="mb-2">{job.title}</h2>
                            <h6 className="text-muted">
                                {job.companyName || "Your Company"}
                            </h6>
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

                    <div className="row mt-3">
                        <div className="col-md-4">
                            <strong>Location</strong>
                            <p>{job.location}</p>
                        </div>
                        <div className="col-md-4">
                            <strong>Salary</strong>
                            <p>₱{job.salary.toLocaleString()}</p>
                        </div>
                        <div className="col-md-4">
                            <strong>Posted</strong>
                            <p>{new Date(job.postedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="mt-3">
                        <h5>Description</h5>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
                    </div>
                </div>
            </div>

            {user?.role === "Employer" && (
                <div className="mt-4">
                    <h3 className="mb-3">🌟 Recommended Talents for this Job</h3>
                    {loadingTalents ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2 text-muted">Finding matching talents...</span>
                        </div>
                    ) : talents.length > 0 ? (
                        <div>
                            {talents.map((talent) => (
                                <TalentCard key={talent.employeeProfileId} talent={talent} />
                            ))}
                        </div>
                    ) : (
                        <div className="card bg-light">
                            <div className="card-body text-center py-4">
                                <p className="text-muted mb-0">
                                    No matching talents found for this job posting yet.
                                </p>
                                <p className="text-muted small mt-1">
                                    As more employees join, they'll appear here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default EmployerJobDetails;