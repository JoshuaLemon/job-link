import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function EmployeeDashboard() {

    const [applications, setApplications] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));
    const [aiResume, setAIResume] = useState(null);    
    const [loadingAI, setLoadingAI] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [employeeProfileId, setEmployeeProfileId] = useState(null);
    const [profile, setProfile] = useState({
        headline: "",
        bio: "",
        location: "",
        phoneNumber: ""
    });

    const [educations, setEducations] = useState([]);

    // Education states
    const [isAddingEducation, setIsAddingEducation] = useState(false);
    const [educationForm, setEducationForm] = useState({
        schoolName: "",
        degree: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: ""
    });

    const [editingEducationId, setEditingEducationId] = useState(null);
    const [editEducationForm, setEditEducationForm] = useState({
        schoolName: "",
        degree: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: ""
    });

    const [experiences, setExperiences] = useState([]);

    // Experience states
    const [isAddingExperience, setIsAddingExperience] = useState(false);
    const [experienceForm, setExperienceForm] = useState({
        companyName: "",
        jobTitle: "",
        description: "",
        startDate: "",
        endDate: ""
    });

    const [skills, setSkills] = useState([]);

    // Skill states
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [skillForm, setSkillForm] = useState({
        skillName: ""
    });

    const [editingSkillId, setEditingSkillId] = useState(null);
    const [editingExperienceId, setEditingExperienceId] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const USE_INLINE_FEEDBACK = true;

    const [feedback, setFeedback] = useState({
        section: "",
        type: "",
        message: ""
    });

    useEffect(() => {
        // Load employee applications
        api.get("/Application/my-applications")
            .then((response) => {
                console.log(response.data);
                setApplications(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

        // Load employee profile
        api.get(`/Profile/${user.userId}`)
            .then((response) => {
                console.log(response.data);
                setProfileExists(true);
                setEmployeeProfileId(response.data.employeeProfileId);
                setProfile({
                    headline: response.data.headline,
                    bio: response.data.bio,
                    location: response.data.location,
                    phoneNumber: response.data.phoneNumber
                });
            })
            .catch(() => {
                console.log("No profile found.");
            });

        // Load education
        api.get("/Education/my-education")
            .then((response) => {
                console.log(response.data);
                setEducations(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

        // Load experience
        api.get("/Experience/my-experience")
            .then((response) => {
                console.log(response.data);
                setExperiences(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

        // Load skills
        api.get("/Skill/my-skills")
            .then((response) => {
                console.log(response.data);
                setSkills(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

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

    const deleteAccount = async () => {
        const confirmed = window.confirm(
            "This will permanently delete your account.\n\nThis action cannot be undone."
        );
        if (!confirmed) return;

        try {
            await api.delete("/User/me");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            showFeedback("account", "success", "Your account has been deleted.");
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            showFeedback("account", "danger", "Unable to delete account.");
        }
    };

    // Profile handlers
    const handleEditProfileClick = () => {
        setIsEditingProfile(true);
    };

    const handleCancelProfile = () => {
        setIsEditingProfile(false);
        // Refetch profile to reset to original values
        api.get(`/Profile/${user.userId}`)
            .then((response) => {
                setProfile({
                    headline: response.data.headline,
                    bio: response.data.bio,
                    location: response.data.location,
                    phoneNumber: response.data.phoneNumber
                });
            })
            .catch(() => {
                console.log("No profile found.");
            });
    };

    const handleSaveProfile = async () => {
        try {
            const request = {
                userId: user.userId,
                headline: profile.headline,
                bio: profile.bio,
                location: profile.location,
                phoneNumber: profile.phoneNumber
            };

            if (profileExists) {
                await api.put(`/Profile/${user.userId}`, request);
            } else {
                const response = await api.post("/Profile", request);
                console.log("Create Profile Response:", response.data);
                setProfileExists(true);
                setEmployeeProfileId(response.data.employeeProfileId);
                console.log("Employee Profile ID:", response.data.employeeProfileId);
            }

            setIsEditingProfile(false);
            showFeedback("profile", "success", "Profile saved successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("profile", "danger", error.response?.data || "Unable to save profile.");
        }
    };

    // Education handlers
    const handleAddEducationClick = () => {
        setIsAddingEducation(true);
        setEducationForm({
            schoolName: "",
            degree: "",
            fieldOfStudy: "",
            startYear: "",
            endYear: ""
        });
    };

    const handleCancelEducation = () => {
        setIsAddingEducation(false);
        setEditingEducationId(null);
        setEducationForm({
            schoolName: "",
            degree: "",
            fieldOfStudy: "",
            startYear: "",
            endYear: ""
        });
        setEditEducationForm({
            schoolName: "",
            degree: "",
            fieldOfStudy: "",
            startYear: "",
            endYear: ""
        });
    };

    const handleAddEducation = async () => {
        if (!employeeProfileId) {
            showFeedback("education", "warning", "Please save your profile first.");
            return;
        }

        try {
            const request = {
                employeeProfileId,
                schoolName: educationForm.schoolName,
                degree: educationForm.degree,
                fieldOfStudy: educationForm.fieldOfStudy,
                startDate: `${educationForm.startYear}-01-01`,
                endDate: `${educationForm.endYear}-12-31`
            };

            const response = await api.post("/Education", request);
            setEducations(prev => [...prev, response.data.education]);
            setIsAddingEducation(false);
            setEducationForm({
                schoolName: "",
                degree: "",
                fieldOfStudy: "",
                startYear: "",
                endYear: ""
            });
            showFeedback("education", "success", "Education added successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("education", "danger", "Unable to add education.");
        }
    };

    const handleEditEducation = (education) => {
        setEditingEducationId(education.educationId);
        setEditEducationForm({
            schoolName: education.schoolName,
            degree: education.degree,
            fieldOfStudy: education.fieldOfStudy,
            startYear: new Date(education.startDate).getFullYear(),
            endYear: new Date(education.endDate).getFullYear()
        });
    };

    const handleSaveEducation = async () => {
        try {
            const request = {
                employeeProfileId,
                schoolName: editEducationForm.schoolName,
                degree: editEducationForm.degree,
                fieldOfStudy: editEducationForm.fieldOfStudy,
                startDate: `${editEducationForm.startYear}-01-01`,
                endDate: `${editEducationForm.endYear}-12-31`
            };

            await api.put(`/Education/${editingEducationId}`, request);
            setEducations(
                educations.map(education =>
                    education.educationId === editingEducationId
                        ? {
                            ...education,
                            schoolName: editEducationForm.schoolName,
                            degree: editEducationForm.degree,
                            fieldOfStudy: editEducationForm.fieldOfStudy,
                            startDate: `${editEducationForm.startYear}-01-01`,
                            endDate: `${editEducationForm.endYear}-12-31`
                        }
                        : education
                )
            );
            setEditingEducationId(null);
            showFeedback("education", "success", "Education updated successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("education", "danger", "Unable to update education.");
        }
    };

    const handleDeleteEducation = async (educationId) => {
        const confirmed = window.confirm("Are you sure you want to delete this education?");
        if (!confirmed) return;

        try {
            await api.delete(`/Education/${educationId}`);
            setEducations(educations.filter(education => education.educationId !== educationId));
            showFeedback("education", "success", "Education deleted successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("education", "danger", "Unable to delete education.");
        }
    };

    // Experience handlers
    const handleAddExperienceClick = () => {
        setIsAddingExperience(true);
        setExperienceForm({
            companyName: "",
            jobTitle: "",
            description: "",
            startDate: "",
            endDate: ""
        });
    };

    const handleCancelExperience = () => {
        setIsAddingExperience(false);
        setEditingExperienceId(null);
        setExperienceForm({
            companyName: "",
            jobTitle: "",
            description: "",
            startDate: "",
            endDate: ""
        });
    };

    const handleSaveExperience = async () => {
        try {
            const request = {
                employeeProfileId: employeeProfileId,
                companyName: experienceForm.companyName,
                jobTitle: experienceForm.jobTitle,
                description: experienceForm.description,
                startDate: experienceForm.startDate,
                endDate: experienceForm.endDate
            };

            if (editingExperienceId === null) {
                await api.post("/Experience", request);
            } else {
                await api.put(`/Experience/${editingExperienceId}`, request);
            }

            const response = await api.get("/Experience/my-experience");
            setExperiences(response.data);
            setIsAddingExperience(false);
            setEditingExperienceId(null);
            setExperienceForm({
                companyName: "",
                jobTitle: "",
                description: "",
                startDate: "",
                endDate: ""
            });
            showFeedback("experience", "success", "Experience saved successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("experience", "danger", "Unable to save experience.");
        }
    };

    const handleEditExperience = (experience) => {
        setEditingExperienceId(experience.experienceId);
        setExperienceForm({
            companyName: experience.companyName,
            jobTitle: experience.jobTitle,
            description: experience.description,
            startDate: experience.startDate.substring(0, 10),
            endDate: experience.endDate.substring(0, 10)
        });
    };

    const handleDeleteExperience = async (experienceId) => {
        const confirmed = window.confirm("Delete this experience?");
        if (!confirmed) return;

        try {
            await api.delete(`/Experience/${experienceId}`);
            setExperiences(previous => previous.filter(x => x.experienceId !== experienceId));
            showFeedback("experience", "success", "Experience deleted.");
        } catch (error) {
            console.error(error);
            showFeedback("experience", "danger", "Unable to delete experience.");
        }
    };

    // Skill handlers
    const handleAddSkillClick = () => {
        setIsAddingSkill(true);
        setSkillForm({ skillName: "" });
    };

    const handleCancelSkill = () => {
        setIsAddingSkill(false);
        setEditingSkillId(null);
        setSkillForm({ skillName: "" });
    };

    const handleSaveSkill = async () => {
        try {
            const request = {
                employeeProfileId: employeeProfileId,
                skillName: skillForm.skillName
            };

            if (editingSkillId === null) {
                await api.post("/Skill", request);
            } else {
                await api.put(`/Skill/${editingSkillId}`, request);
            }

            const response = await api.get("/Skill/my-skills");
            setSkills(response.data);
            setIsAddingSkill(false);
            setEditingSkillId(null);
            setSkillForm({ skillName: "" });
            showFeedback("skill", "success", "Skill saved successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("skill", "danger", "Unable to save skill.");
        }
    };

    const handleEditSkill = (skill) => {
        setEditingSkillId(skill.skillId);
        setSkillForm({ skillName: skill.skillName });
    };

    const handleDeleteSkill = async (skillId) => {
        const confirmed = window.confirm("Delete this skill?");
        if (!confirmed) return;

        try {
            await api.delete(`/Skill/${skillId}`);
            setSkills(previous => previous.filter(skill => skill.skillId !== skillId));
            showFeedback("skill", "success", "Skill deleted.");
        } catch (error) {
            console.error(error);
            showFeedback("skill", "danger", "Unable to delete skill.");
        }
    };

    const downloadResume = () => {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL;

        fetch(`${apiUrl}/Profile/resume-pdf/${user.userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to download.");
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${user.firstName ?? "Resume"}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error(error);
            showFeedback("resume", "danger", "Unable to download resume.");
        });
    };

    const generateAIResume = async () => {
        try {
            setLoadingAI(true);
            const response = await api.post("/AI/generate-resume");
            setAIResume(response.data);  
            setHasGenerated(true);
        } catch (err) {
            console.error(err);
            showFeedback("aiResume", "danger", "Failed to generate AI resume.");
        } finally {
            setLoadingAI(false);
        }
    };

    const downloadAIResume = () => {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL;

        fetch(`${apiUrl}/Resume/download-ai`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(aiResume)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to download.");
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "AI_Resume.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error(error);
            showFeedback("aiResume", "danger", "Failed to download AI Resume.");
        });
    };
   
    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Profile</h2>
                <div>
                    <button className="btn btn-success me-2" onClick={downloadResume}>
                        📄 Download Resume
                    </button>
                    <button className="btn btn-primary" onClick={generateAIResume} disabled={loadingAI}>
                        {loadingAI ? "Generating..." : "✨ Generate with AI"}
                    </button>
                    {hasGenerated && (
                        <>
                            <button className="btn btn-success ms-2" onClick={downloadAIResume}>
                                📄 Download AI Resume
                            </button>
                            <div className="card mt-4">
                                <div className="card-header">
                                    <h5 className="mb-0">AI Resume Preview</h5>
                                </div>
                                <div className="card-body">
                                    <h3>{aiResume.firstName} {aiResume.lastName}</h3>
                                    <h5 className="text-muted">{aiResume.headline}</h5>
                                    <p><strong>Email:</strong> {aiResume.email}</p>
                                    <p><strong>Phone:</strong> {aiResume.phoneNumber}</p>
                                    <p><strong>Location:</strong> {aiResume.location}</p>
                                    <hr />
                                    <h5>Professional Summary</h5>
                                    <p>{aiResume.bio}</p>
                                    <hr />
                                    <h5>Skills</h5>
                                    <ul>
                                        {aiResume.skills.map((skill, index) => (
                                            <li key={index}>{skill}</li>
                                        ))}
                                    </ul>
                                    <hr />
                                    <h5>Experience</h5>
                                    {aiResume.experiences.map((experience, index) => (
                                        <div key={index} className="mb-3">
                                            <strong>{experience.jobTitle}</strong>
                                            <br />
                                            {experience.companyName}
                                            <br />
                                            {new Date(experience.startDate).getFullYear()}
                                            {" - "}
                                            {new Date(experience.endDate).getFullYear()}
                                            <p>{experience.description}</p>
                                        </div>
                                    ))}
                                    <hr />
                                    <h5>Education</h5>
                                    {aiResume.educations.map((education, index) => (
                                        <div key={index} className="mb-3">
                                            <strong>{education.schoolName}</strong>
                                            <br />
                                            {education.degree}
                                            <br />
                                            {education.fieldOfStudy}
                                            <br />
                                            {new Date(education.startDate).getFullYear()}
                                            {" - "}
                                            {new Date(education.endDate).getFullYear()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
      
            {/* Profile Section */}
            <div className="card mb-5">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Profile Information</h5>
                        {!isEditingProfile && (
                            <button className="btn btn-primary" onClick={handleEditProfileClick}>
                                ✏️ Edit Profile
                            </button>
                        )}
                    </div>

                    <FeedbackMessage section="profile" />

                    {isEditingProfile ? (
                        // Edit mode - show form fields
                        <>
                            <div className="mb-3">
                                <label className="form-label">Headline <span className="text-muted">(e.g., Senior Software Engineer)</span></label>
                                <input
                                    className="form-control"
                                    placeholder="e.g., Senior Software Engineer at Google"
                                    value={profile.headline}
                                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Bio <span className="text-muted">(Tell employers about yourself)</span></label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="e.g., Passionate software engineer with 5+ years of experience in full-stack development..."
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Location <span className="text-muted">(City, Country)</span></label>
                                <input
                                    className="form-control"
                                    placeholder="e.g., Manila, Philippines"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Phone Number</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g., +63 912 345 6789"
                                    value={profile.phoneNumber}
                                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <button className="btn btn-success me-2" onClick={handleSaveProfile}>
                                    Save Profile
                                </button>
                                <button className="btn btn-secondary" onClick={handleCancelProfile}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        // View mode - show profile data
                        <>
                            {profile.headline && (
                                <p><strong>Headline:</strong> {profile.headline}</p>
                            )}
                            {profile.bio && (
                                <p><strong>Bio:</strong> {profile.bio}</p>
                            )}
                            {profile.location && (
                                <p><strong>Location:</strong> {profile.location}</p>
                            )}
                            {profile.phoneNumber && (
                                <p><strong>Phone:</strong> {profile.phoneNumber}</p>
                            )}
                            {!profile.headline && !profile.bio && !profile.location && !profile.phoneNumber && (
                                <div className="text-center py-3">
                                    <p className="text-muted mb-2">No profile information added yet.</p>
                                    <p className="text-muted small">Add your headline, bio, location, and phone number to help employers find you.</p>
                                    <button className="btn btn-primary btn-sm mt-2" onClick={handleEditProfileClick}>
                                        ✏️ Add Profile Information
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {aiResume && (
                <div className="card mb-5">
                    <div className="card-header">
                        <h4>AI Generated Resume</h4>
                    </div>
                    <div className="card-body">
                        <h2>{aiResume.firstName} {aiResume.lastName}</h2>
                        <p><strong>{aiResume.headline}</strong></p>
                        <p>{aiResume.email}</p>
                        <p>{aiResume.phoneNumber}</p>
                        <p>{aiResume.location}</p>
                        <hr />
                        <h5>Professional Summary</h5>
                        <p>{aiResume.bio}</p>
                        <hr />
                        <h5>Skills</h5>
                        <ul>
                            {aiResume.skills.map(skill => (
                                <li key={skill}>{skill}</li>
                            ))}
                        </ul>
                        <hr />
                        <h5>Experience</h5>
                        {aiResume.experiences.map((exp, index) => (
                            <div key={index} className="mb-3">
                                <strong>{exp.jobTitle}</strong>
                                <br />
                                {exp.companyName}
                                <br />
                                {exp.description}
                            </div>
                        ))}
                        <hr />
                        <h5>Education</h5>
                        {aiResume.educations.map((edu, index) => (
                            <div key={index} className="mb-3">
                                <strong>{edu.degree}</strong>
                                <br />
                                {edu.schoolName}
                                <br />
                                {edu.fieldOfStudy}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Education</h2>
                {!isAddingEducation && !editingEducationId && (
                    <button className="btn btn-primary" onClick={handleAddEducationClick}>
                        + Add Education
                    </button>
                )}
            </div>

            <FeedbackMessage section="education" />

            {/* Education Add Form */}
            {isAddingEducation && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">Add New Education</h5>
                        <div className="mb-3">
                            <label className="form-label">School Name</label>
                            <input
                                className="form-control"
                                placeholder="e.g., University of the Philippines"
                                value={educationForm.schoolName}
                                onChange={(e) => setEducationForm({ ...educationForm, schoolName: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Degree</label>
                            <input
                                className="form-control"
                                placeholder="e.g., Bachelor of Science in Computer Science"
                                value={educationForm.degree}
                                onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Field Of Study</label>
                            <input
                                className="form-control"
                                placeholder="e.g., Software Engineering"
                                value={educationForm.fieldOfStudy}
                                onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                            />
                        </div>
                        <div className="row">
                            <div className="col">
                                <label className="form-label">Start Year</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="e.g., 2020"
                                    value={educationForm.startYear}
                                    onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
                                />
                            </div>
                            <div className="col">
                                <label className="form-label">End Year</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="e.g., 2024"
                                    value={educationForm.endYear}
                                    onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <button className="btn btn-success me-2" onClick={handleAddEducation}>
                                Confirm Add
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelEducation}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Education List or No Education Message */}
            {educations.length === 0 && !isAddingEducation ? (
                <div className="card mb-3">
                    <div className="card-body text-center py-4">
                        <p className="text-muted mb-2">No education added yet.</p>
                        <p className="text-muted small">Add your educational background to showcase your qualifications.</p>
                        <button className="btn btn-primary btn-sm mt-2" onClick={handleAddEducationClick}>
                            + Add Education
                        </button>
                    </div>
                </div>
            ) : (
                educations.map((education) => (
                    <div key={education.educationId} className="card mb-3">
                        <div className="card-body">
                            {editingEducationId === education.educationId ? (
                                <>
                                    <h5 className="mb-3">Edit Education</h5>
                                    <div className="mb-3">
                                        <label>School Name</label>
                                        <input
                                            className="form-control"
                                            value={editEducationForm.schoolName}
                                            onChange={(e) => setEditEducationForm({ ...editEducationForm, schoolName: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Degree</label>
                                        <input
                                            className="form-control"
                                            value={editEducationForm.degree}
                                            onChange={(e) => setEditEducationForm({ ...editEducationForm, degree: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Field Of Study</label>
                                        <input
                                            className="form-control"
                                            value={editEducationForm.fieldOfStudy}
                                            onChange={(e) => setEditEducationForm({ ...editEducationForm, fieldOfStudy: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <label>Start Year</label>
                                            <input
                                                className="form-control"
                                                type="number"
                                                value={editEducationForm.startYear}
                                                onChange={(e) => setEditEducationForm({ ...editEducationForm, startYear: e.target.value })}
                                            />
                                        </div>
                                        <div className="col">
                                            <label>End Year</label>
                                            <input
                                                className="form-control"
                                                type="number"
                                                value={editEducationForm.endYear}
                                                onChange={(e) => setEditEducationForm({ ...editEducationForm, endYear: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <button className="btn btn-success me-2" onClick={handleSaveEducation}>
                                            Save Changes
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleCancelEducation}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h5>{education.degree}</h5>
                                    <p>{education.schoolName}</p>
                                    <p>{education.fieldOfStudy}</p>
                                    <p>
                                        {new Date(education.startDate).getFullYear()}
                                        {" - "}
                                        {new Date(education.endDate).getFullYear()}
                                    </p>
                                    <button
                                        className="btn btn-warning me-2"
                                        onClick={() => handleEditEducation(education)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDeleteEducation(education.educationId)}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}

            <hr className="my-5" />

            {/* Experience Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">My Experience</h2>
                {!isAddingExperience && !editingExperienceId && (
                    <button className="btn btn-primary" onClick={handleAddExperienceClick}>
                        + Add Experience
                    </button>
                )}
            </div>

            <FeedbackMessage section="experience" />

            {/* Experience Add Form */}
            {isAddingExperience && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">Add New Experience</h5>
                        <div className="mb-3">
                            <label className="form-label">Company Name</label>
                            <input
                                className="form-control"
                                placeholder="e.g., Google"
                                value={experienceForm.companyName}
                                onChange={(e) => setExperienceForm({ ...experienceForm, companyName: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Job Title</label>
                            <input
                                className="form-control"
                                placeholder="e.g., Senior Software Engineer"
                                value={experienceForm.jobTitle}
                                onChange={(e) => setExperienceForm({ ...experienceForm, jobTitle: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Describe your responsibilities and achievements..."
                                value={experienceForm.description}
                                onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                            />
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={experienceForm.startDate}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={experienceForm.endDate}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <button className="btn btn-success me-2" onClick={handleSaveExperience}>
                                Confirm Add
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelExperience}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Experience List */}
            {experiences.length === 0 ? (
                <div className="card mb-3">
                    <div className="card-body text-center py-4">
                        <p className="text-muted mb-2">No experience added yet.</p>
                        <p className="text-muted small">Add your work experience to demonstrate your skills and expertise.</p>
                        <button className="btn btn-primary btn-sm mt-2" onClick={handleAddExperienceClick}>
                            + Add Experience
                        </button>
                    </div>
                </div>
            ) : (
                experiences.map(experience => (
                    <div key={experience.experienceId} className="card mb-3">
                        <div className="card-body">
                            {editingExperienceId === experience.experienceId ? (
                                <>
                                    <h5 className="mb-3">Edit Experience</h5>
                                    <div className="mb-3">
                                        <label className="form-label">Company Name</label>
                                        <input
                                            className="form-control"
                                            value={experienceForm.companyName}
                                            onChange={(e) => setExperienceForm({ ...experienceForm, companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Job Title</label>
                                        <input
                                            className="form-control"
                                            value={experienceForm.jobTitle}
                                            onChange={(e) => setExperienceForm({ ...experienceForm, jobTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={experienceForm.description}
                                            onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={experienceForm.startDate}
                                                onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={experienceForm.endDate}
                                                onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <button className="btn btn-success me-2" onClick={handleSaveExperience}>
                                            Save Changes
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleCancelExperience}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h5>{experience.jobTitle}</h5>
                                    <h6 className="text-muted">{experience.companyName}</h6>
                                    <p>{experience.description}</p>
                                    <p>
                                        <strong>Start:</strong>{" "}
                                        {new Date(experience.startDate).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>End:</strong>{" "}
                                        {new Date(experience.endDate).toLocaleDateString()}
                                    </p>
                                    <button
                                        className="btn btn-warning me-2"
                                        onClick={() => handleEditExperience(experience)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDeleteExperience(experience.experienceId)}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}

            <hr className="my-5" />

            {/* Skills Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">My Skills</h2>
                {!isAddingSkill && !editingSkillId && (
                    <button className="btn btn-primary" onClick={handleAddSkillClick}>
                        + Add Skill
                    </button>
                )}
            </div>

            <FeedbackMessage section="skill" />

            {/* Skill Add Form */}
            {isAddingSkill && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">Add New Skill</h5>
                        <div className="mb-3">
                            <label className="form-label">Skill Name</label>
                            <input
                                className="form-control"
                                placeholder="e.g., JavaScript, Python, Project Management"
                                value={skillForm.skillName}
                                onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                            />
                            <small className="text-muted">Add one skill at a time (e.g., React, Python, Leadership)</small>
                        </div>
                        <div className="mt-3">
                            <button className="btn btn-success me-2" onClick={handleSaveSkill}>
                                Confirm Add
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelSkill}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Skills List */}
            {skills.length === 0 ? (
                <div className="card mb-3">
                    <div className="card-body text-center py-4">
                        <p className="text-muted mb-2">No skills added yet.</p>
                        <p className="text-muted small">Add your skills to help employers find you.</p>
                        <button className="btn btn-primary btn-sm mt-2" onClick={handleAddSkillClick}>
                            + Add Skill
                        </button>
                    </div>
                </div>
            ) : (
                skills.map(skill => (
                    <div key={skill.skillId} className="card mb-3">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            {editingSkillId === skill.skillId ? (
                                <>
                                    <input
                                        className="form-control me-3"
                                        value={skillForm.skillName}
                                        onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                                        style={{ maxWidth: '300px' }}
                                    />
                                    <div>
                                        <button className="btn btn-success me-2" onClick={handleSaveSkill}>
                                            Save
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleCancelSkill}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h5 className="mb-0">{skill.skillName}</h5>
                                    <div>
                                        <button
                                            className="btn btn-warning me-2"
                                            onClick={() => handleEditSkill(skill)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteSkill(skill.skillId)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}

            {/* Applications Section */}
            <h2 className="mb-4 fw-bold">My Applications</h2>
            {applications.length === 0 ? (
                <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                        <h4>No Applications Yet</h4>
                        <p className="text-muted mb-3">
                            Start applying to jobs and track your application progress here.
                        </p>
                        <Link to="/" className="btn btn-primary">
                            Browse Available Jobs
                        </Link>
                    </div>
                </div>
            ) : (
                applications.map(application => (
                    <div key={application.applicationId} className="card shadow-sm mb-4 border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h3 className="mb-1">{application.job.title}</h3>
                                    <p className="text-muted mb-3">{application.job.location}</p>
                                </div>
                                <span className={`badge fs-6 px-3 py-2 ${
                                    application.status === "Hired" ? "bg-success" :
                                    application.status === "Interview" ? "bg-primary" :
                                    application.status === "Rejected" ? "bg-danger" :
                                    application.status === "Pending" ? "bg-warning text-dark" :
                                    application.status === "Screening" ? "bg-info text-dark" :
                                    application.status === "Technical Exam" ? "bg-dark" :
                                    application.status === "Offer" ? "bg-secondary" :
                                    "bg-light text-dark"
                                }`}>
                                    {application.status}
                                </span>
                            </div>
                            <hr />
                            <div className="row">
                                <div className="col-md-4 mb-2">
                                    <strong>Employment</strong>
                                    <br />
                                    {application.job.employmentType}
                                </div>
                                <div className="col-md-4 mb-2">
                                    <strong>Salary</strong>
                                    <br />
                                    ₱{application.job.salary.toLocaleString()}
                                </div>
                                <div className="col-md-4 mb-2">
                                    <strong>Applied</strong>
                                    <br />
                                    {new Date(application.appliedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <hr />
            <FeedbackMessage section="account" />
            <button className="btn btn-outline-danger" onClick={deleteAccount}>
                Delete My Account
            </button>
        </div>
    );
}

export default EmployeeDashboard;