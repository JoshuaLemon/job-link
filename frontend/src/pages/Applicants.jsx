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
            "Hired": "bg-success",
            "Interview": "bg-primary",
            "Rejected": "bg-danger",
            "Pending": "bg-warning text-dark",
            "Screening": "bg-info text-dark",
            "Technical Exam": "bg-dark",
            "Offer": "bg-secondary"
        };
        return statusMap[status] || "bg-light text-dark";
    };

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Applicants</h2>
                <Link to="/employer-dashboard" className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="applicants" />

            {/* Loading State */}
            {loading && (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Applicants List */}
            {!loading && applicants.length === 0 ? (
                <div className="card mb-3">
                    <div className="card-body text-center py-4">
                        <p className="text-muted mb-0">No applicants yet.</p>
                    </div>
                </div>
            ) : (
                applicants.map(application => (
                    <div key={application.applicationId} className="card mb-3">
                        <div className="card-body">
                            {/* Applicant Header */}
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h4 className="mb-1">
                                        {application.applicant.firstName} {application.applicant.lastName}
                                    </h4>
                                    <p className="text-muted mb-0">
                                        <strong>Headline:</strong> {application.applicant.headline || "Not specified"}
                                    </p>
                                </div>
                                <span className={`badge fs-6 px-3 py-2 ${getStatusBadgeClass(application.status)}`}>
                                    {application.status}
                                </span>
                            </div>

                            {/* Applicant Details */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <p className="mb-1">
                                        <strong>Location:</strong> {application.applicant.location || "Not specified"}
                                    </p>
                                </div>
                                <div className="col-md-4">
                                    <p className="mb-1">
                                        <strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="row align-items-end">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Update Status</label>
                                    <select
                                        className="form-select"
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
                                        <small className="text-muted">Updating...</small>
                                    )}
                                </div>
                                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                                    <Link
                                        to={`/employee-profile/${application.applicant.employeeProfileId}`}
                                        className="btn btn-primary"
                                    >
                                        View Full Profile
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