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
            <div className="page-container">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted-light mt-3">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h4 className="empty-state-title">Profile Not Found</h4>
                    <p className="empty-state-text">Unable to load the employee profile.</p>
                    <Link to="/employer" className="btn-primary">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Employee Profile</h2>
                <Link to="/employer" className="btn-back">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="profile" />

            <div className="profile-card">
                <div className="profile-card-body">
                    <div className="profile-header">
                        <div>
                            <h2 className="profile-name">{profile.firstName} {profile.lastName}</h2>
                            {profile.headline && (
                                <h5 className="profile-headline">{profile.headline}</h5>
                            )}
                        </div>
                        <span className="badge-employee">Employee</span>
                    </div>

                    {profile.bio && (
                        <p className="profile-bio">{profile.bio}</p>
                    )}

                    <div className="profile-details">
                        {profile.email && (
                            <div>
                                <strong>Email:</strong> {profile.email}
                            </div>
                        )}
                        {profile.location && (
                            <div>
                                <strong>Location:</strong> {profile.location}
                            </div>
                        )}
                        {profile.phoneNumber && (
                            <div>
                                <strong>Phone:</strong> {profile.phoneNumber}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <div className="profile-section-body">
                    <h3 className="profile-section-title">Education</h3>
                    {!profile.educations || profile.educations.length === 0 ? (
                        <div className="empty-state-small">
                            <p className="text-muted-light">No education added.</p>
                        </div>
                    ) : (
                        profile.educations.map(education => (
                            <div key={education.educationId} className="profile-item">
                                <h5 className="profile-item-title">{education.schoolName}</h5>
                                <p className="profile-item-subtitle">
                                    <strong>{education.degree}</strong>
                                    {education.fieldOfStudy && (
                                        <> - {education.fieldOfStudy}</>
                                    )}
                                </p>
                                <small className="profile-item-date">
                                    {new Date(education.startDate).toLocaleDateString()} - {new Date(education.endDate).toLocaleDateString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="profile-section">
                <div className="profile-section-body">
                    <h3 className="profile-section-title">Experience</h3>
                    {!profile.experiences || profile.experiences.length === 0 ? (
                        <div className="empty-state-small">
                            <p className="text-muted-light">No experience added.</p>
                        </div>
                    ) : (
                        profile.experiences.map(experience => (
                            <div key={experience.experienceId} className="profile-item">
                                <h5 className="profile-item-title">{experience.companyName}</h5>
                                <p className="profile-item-subtitle">
                                    <strong>{experience.jobTitle}</strong>
                                </p>
                                {experience.description && (
                                    <p className="profile-item-desc">{experience.description}</p>
                                )}
                                <small className="profile-item-date">
                                    {new Date(experience.startDate).toLocaleDateString()} - {new Date(experience.endDate).toLocaleDateString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="profile-section">
                <div className="profile-section-body">
                    <h3 className="profile-section-title">Skills</h3>
                    {!profile.skills || profile.skills.length === 0 ? (
                        <div className="empty-state-small">
                            <p className="text-muted-light">No skills added.</p>
                        </div>
                    ) : (
                        <div className="skills-container">
                            {profile.skills.map(skill => (
                                <span key={skill.skillId} className="skill-tag">
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