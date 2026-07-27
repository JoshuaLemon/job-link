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
                    <Link to="/employer" className="btn-primary">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const tags = job.tags ? job.tags.split(',').map(t => t.trim()).filter(t => t) : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Job Details</h2>
                <Link to="/employer" className="btn-back">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="job" />

            <div className="details-card">
                <div className="details-card-body">
                    <div className="details-header">
                        <div>
                            <h2 className="details-title">{job.title}</h2>
                            <h6 className="details-company">
                                {job.companyName || "Your Company"}
                            </h6>
                        </div>
                        <span className={`badge ${job.employmentType === 'Full-time' ? 'badge-primary' : job.employmentType === 'Part-time' ? 'badge-info' : job.employmentType === 'Contract' ? 'badge-warning' : 'badge-secondary'}`}>
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
                            <p>₱{job.salary.toLocaleString()}</p>
                        </div>
                        <div>
                            <strong>Posted</strong>
                            <p>{new Date(job.postedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="details-description">
                        <h5>Description</h5>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
                    </div>
                </div>
            </div>

            {user?.role === "Employer" && (
                <div className="talents-section">
                    <h3 className="talents-title">🌟 Recommended Talents for this Job</h3>
                    {loadingTalents ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2 text-muted-light">Finding matching talents...</span>
                        </div>
                    ) : talents.length > 0 ? (
                        <div>
                            {talents.map((talent) => (
                                <TalentCard key={talent.employeeProfileId} talent={talent} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-small">
                            <p className="text-muted-light">No matching talents found for this job posting yet.</p>
                            <p className="text-muted-light small mt-1">As more employees join, they'll appear here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default EmployerJobDetails;