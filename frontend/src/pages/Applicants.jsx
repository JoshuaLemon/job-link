import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function Applicants() {

    const { id } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

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
        loadApplicants();
    }, [id]);

    const loadApplicants = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/Application/job/${id}`);
            setApplicants(response.data);
        } catch (error) {
            console.error(error);
            showFeedback("applicants", "danger", "Failed to load applicants.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId, status) => {
        setUpdatingId(applicationId);
        try {
            await api.put(`/Application/${applicationId}/status`, { status });
            setApplicants(previous =>
                previous.map(app =>
                    app.applicationId === applicationId
                        ? { ...app, status }
                        : app
                )
            );
            showFeedback("applicants", "success", "Application status updated successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("applicants", "danger", "Unable to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            "Hired": "status-hired",
            "Interview": "status-interview",
            "Rejected": "status-rejected",
            "Pending": "status-pending",
            "Screening": "status-screening",
            "Technical Exam": "status-technical",
            "Offer": "status-offer"
        };
        return statusMap[status] || "status-default";
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Applicants</h2>
                <Link to="/employer" className="btn-back">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="applicants" />

            {loading && (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {!loading && applicants.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-state-text">No applicants yet.</p>
                </div>
            ) : (
                applicants.map(application => (
                    <div key={application.applicationId} className="applicant-card">
                        <div className="applicant-card-body">
                            <div className="applicant-header">
                                <div>
                                    <h4 className="applicant-name">
                                        {application.applicant.firstName} {application.applicant.lastName}
                                    </h4>
                                    <p className="applicant-headline">
                                        <strong>Headline:</strong> {application.applicant.headline || "Not specified"}
                                    </p>
                                </div>
                                <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                                    {application.status}
                                </span>
                            </div>

                            <div className="applicant-details">
                                <div>
                                    <p className="applicant-detail">
                                        <strong>Location:</strong> {application.applicant.location || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="applicant-detail">
                                        <strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="applicant-actions">
                                <div className="status-update">
                                    <label className="status-label">Update Status</label>
                                    <select
                                        className="status-select"
                                        value={application.status}
                                        onChange={(e) => updateStatus(application.applicationId, e.target.value)}
                                        disabled={updatingId === application.applicationId}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Screening">Screening</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Technical Exam">Technical Exam</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Hired">Hired</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                    {updatingId === application.applicationId && (
                                        <small className="updating-text">Updating...</small>
                                    )}
                                </div>
                                <div>
                                    <Link
                                        to={`/employee-profile/${application.applicant.employeeProfileId}`}
                                        className="btn-profile"
                                    >
                                        View Full Profile →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Applicants;