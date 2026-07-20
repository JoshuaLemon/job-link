import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function EmployerViewProfile() {

    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/Profile/employee/${id}`);
            setProfile(response.data);
        } catch (error) {
            console.error(error);
            setError("Failed to load profile. Please try again.");
            showFeedback("profile", "danger", "Failed to load employee profile.");
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
                    <p className="mt-3 text-muted">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <h4 className="text-danger">Profile Not Found</h4>
                        <p className="text-muted">Unable to load the employee profile.</p>
                        <Link to="/employer-dashboard" className="btn btn-primary">
                            Back to Dashboard
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
                <h2>Employee Profile</h2>
                <Link to="/employer-dashboard" className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="profile" />

            {/* Profile Information */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h2 className="mb-1">{profile.firstName} {profile.lastName}</h2>
                            {profile.headline && (
                                <h5 className="text-muted">{profile.headline}</h5>
                            )}
                        </div>
                        <span className="badge bg-primary fs-6 px-3 py-2">
                            Employee
                        </span>
                    </div>

                    {profile.bio && (
                        <p className="mt-3">{profile.bio}</p>
                    )}

                    <div className="row mt-3">
                        {profile.email && (
                            <div className="col-md-6 mb-2">
                                <strong>Email:</strong> {profile.email}
                            </div>
                        )}
                        {profile.location && (
                            <div className="col-md-6 mb-2">
                                <strong>Location:</strong> {profile.location}
                            </div>
                        )}
                        {profile.phoneNumber && (
                            <div className="col-md-6 mb-2">
                                <strong>Phone:</strong> {profile.phoneNumber}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Education Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <h3 className="mb-3">Education</h3>
                    {!profile.educations || profile.educations.length === 0 ? (
                        <div className="text-center py-3">
                            <p className="text-muted mb-0">No education added.</p>
                        </div>
                    ) : (
                        profile.educations.map(education => (
                            <div key={education.educationId} className="mb-4">
                                <h5>{education.schoolName}</h5>
                                <p className="mb-1">
                                    <strong>{education.degree}</strong>
                                    {education.fieldOfStudy && (
                                        <> - {education.fieldOfStudy}</>
                                    )}
                                </p>
                                <small className="text-muted">
                                    {new Date(education.startDate).toLocaleDateString()} - {new Date(education.endDate).toLocaleDateString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Experience Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <h3 className="mb-3">Experience</h3>
                    {!profile.experiences || profile.experiences.length === 0 ? (
                        <div className="text-center py-3">
                            <p className="text-muted mb-0">No experience added.</p>
                        </div>
                    ) : (
                        profile.experiences.map(experience => (
                            <div key={experience.experienceId} className="mb-4">
                                <h5>{experience.companyName}</h5>
                                <p className="mb-1">
                                    <strong>{experience.jobTitle}</strong>
                                </p>
                                {experience.description && (
                                    <p className="mb-1">{experience.description}</p>
                                )}
                                <small className="text-muted">
                                    {new Date(experience.startDate).toLocaleDateString()} - {new Date(experience.endDate).toLocaleDateString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Skills Section */}
            <div className="card">
                <div className="card-body">
                    <h3 className="mb-3">Skills</h3>
                    {!profile.skills || profile.skills.length === 0 ? (
                        <div className="text-center py-3">
                            <p className="text-muted mb-0">No skills added.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {profile.skills.map(skill => (
                                <span key={skill.skillId} className="badge bg-primary fs-6 px-3 py-2">
                                    {skill.skillName}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmployerViewProfile;