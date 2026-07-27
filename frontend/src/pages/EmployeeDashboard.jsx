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

    const [isAddingEducation, setIsAddingEducation] = useState(false);
    const [educationForm, setEducationForm] = useState({
        schoolName: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: ""
    });

    const [editingEducationId, setEditingEducationId] = useState(null);
    const [editEducationForm, setEditEducationForm] = useState({
        schoolName: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: ""
    });

    const [experiences, setExperiences] = useState([]);
    const [isAddingExperience, setIsAddingExperience] = useState(false);
    const [experienceForm, setExperienceForm] = useState({
        companyName: "",
        jobTitle: "",
        description: "",
        startDate: "",
        endDate: ""
    });

    const [skills, setSkills] = useState([]);
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
        api.get("/Application/my-applications")
            .then((response) => {
                console.log(response.data);
                setApplications(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

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

        api.get("/Education/my-education")
            .then((response) => {
                console.log(response.data);
                setEducations(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

        api.get("/Experience/my-experience")
            .then((response) => {
                console.log(response.data);
                setExperiences(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

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

    const handleCancelProfile = () => {
        setIsEditingProfile(false);
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

    const handleEditProfileClick = () => {
        setIsEditingProfile(true);
    };

    const handleAddEducationClick = () => {
        setIsAddingEducation(true);
        setEducationForm({
            schoolName: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: ""
        });
    };

    const handleCancelEducation = () => {
        setIsAddingEducation(false);
        setEditingEducationId(null);
        setEducationForm({
            schoolName: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: ""
        });
        setEditEducationForm({
            schoolName: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: ""
        });
    };

    const handleAddEducation = async () => {
        if (!employeeProfileId) {
            showFeedback("education", "warning", "Please save your profile first.");
            return;
        }

        const dateRegex = /^\d{4}-\d{2}$/;
        if (!dateRegex.test(educationForm.startDate)) {
            showFeedback("education", "danger", "Start date must be in YYYY-MM format.");
            return;
        }
        if (!dateRegex.test(educationForm.endDate)) {
            showFeedback("education", "danger", "End date must be in YYYY-MM format.");
            return;
        }

        const startDate = new Date(educationForm.startDate);
        const endDate = new Date(educationForm.endDate);
        const currentDate = new Date();
        
        const startYearMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endYearMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        const currentYearMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        if (!educationForm.schoolName.trim()) {
            showFeedback("education", "danger", "Please enter a school name.");
            return;
        }
        if (!educationForm.degree.trim()) {
            showFeedback("education", "danger", "Please enter a degree.");
            return;
        }
        if (!educationForm.fieldOfStudy.trim()) {
            showFeedback("education", "danger", "Please enter a field of study.");
            return;
        }
        if (startYearMonth > currentYearMonth) {
            showFeedback("education", "danger", `Start date cannot be in the future.`);
            return;
        }
        if (endYearMonth > currentYearMonth) {
            showFeedback("education", "danger", `End date cannot be in the future.`);
            return;
        }
        if (endYearMonth < startYearMonth) {
            showFeedback("education", "danger", "End date cannot be before start date.");
            return;
        }

        try {
            const request = {
                employeeProfileId,
                schoolName: educationForm.schoolName,
                degree: educationForm.degree,
                fieldOfStudy: educationForm.fieldOfStudy,
                startDate: `${educationForm.startDate}-01`,
                endDate: `${educationForm.endDate}-01`
            };

            const response = await api.post("/Education", request);
            setEducations(prev => [...prev, response.data.education]);
            setIsAddingEducation(false);
            setEducationForm({
                schoolName: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: ""
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
            startDate: education.startDate.substring(0, 7),
            endDate: education.endDate.substring(0, 7)
        });
    };

    const handleSaveEducation = async () => {
        const startDate = new Date(editEducationForm.startDate);
        const endDate = new Date(editEducationForm.endDate);
        const currentDate = new Date();
        
        const startYearMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endYearMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        const currentYearMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        if (!editEducationForm.schoolName.trim()) {
            showFeedback("education", "danger", "Please enter a school name.");
            return;
        }
        if (!editEducationForm.degree.trim()) {
            showFeedback("education", "danger", "Please enter a degree.");
            return;
        }
        if (!editEducationForm.fieldOfStudy.trim()) {
            showFeedback("education", "danger", "Please enter a field of study.");
            return;
        }
        if (!editEducationForm.startDate) {
            showFeedback("education", "danger", "Please select a start date.");
            return;
        }
        if (!editEducationForm.endDate) {
            showFeedback("education", "danger", "Please select an end date.");
            return;
        }
        if (startYearMonth > currentYearMonth) {
            showFeedback("education", "danger", `Start date cannot be in the future.`);
            return;
        }
        if (endYearMonth > currentYearMonth) {
            showFeedback("education", "danger", `End date cannot be in the future.`);
            return;
        }
        if (endYearMonth < startYearMonth) {
            showFeedback("education", "danger", "End date cannot be before start date.");
            return;
        }

        try {
            const request = {
                employeeProfileId,
                schoolName: editEducationForm.schoolName,
                degree: editEducationForm.degree,
                fieldOfStudy: editEducationForm.fieldOfStudy,
                startDate: `${editEducationForm.startDate}-01`,
                endDate: `${editEducationForm.endDate}-01`
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
                            startDate: `${editEducationForm.startDate}-01`,
                            endDate: `${editEducationForm.endDate}-01`
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
        const startDate = new Date(experienceForm.startDate);
        const endDate = new Date(experienceForm.endDate);
        const currentDate = new Date();
        
        const startYearMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endYearMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        const currentYearMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        if (!experienceForm.companyName.trim()) {
            showFeedback("experience", "danger", "Please enter a company name.");
            return;
        }
        if (!experienceForm.jobTitle.trim()) {
            showFeedback("experience", "danger", "Please enter a job title.");
            return;
        }
        if (!experienceForm.startDate) {
            showFeedback("experience", "danger", "Please select a start date.");
            return;
        }
        if (!experienceForm.endDate) {
            showFeedback("experience", "danger", "Please select an end date.");
            return;
        }
        if (startYearMonth > currentYearMonth) {
            showFeedback("experience", "danger", `Start date cannot be in the future.`);
            return;
        }
        if (endYearMonth > currentYearMonth) {
            showFeedback("experience", "danger", `End date cannot be in the future.`);
            return;
        }
        if (endYearMonth < startYearMonth) {
            showFeedback("experience", "danger", "End date cannot be before start date.");
            return;
        }

        try {
            const request = {
                employeeProfileId: employeeProfileId,
                companyName: experienceForm.companyName,
                jobTitle: experienceForm.jobTitle,
                description: experienceForm.description,
                startDate: `${experienceForm.startDate}-01`,
                endDate: `${experienceForm.endDate}-01`
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
            startDate: experience.startDate.substring(0, 7),
            endDate: experience.endDate.substring(0, 7)
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
    <div className="profile-container">
        <div className="dashboard-header">
            <h2 className="page-title">My Profile</h2>
            <div className="header-actions">
                <button className="btn-success" onClick={downloadResume}>
                    📄 Download Resume
                </button>
                <button className="btn-primary" onClick={generateAIResume} disabled={loadingAI}>
                    {loadingAI ? "Generating..." : "✨ Generate with AI"}
                </button>
                {hasGenerated && (
                    <>
                        <button className="btn-success ms-2" onClick={downloadAIResume}>
                            📄 Download AI Resume
                        </button>
                        <div className="ai-resume-preview">
                            <div className="ai-resume-header">
                                <h5 className="ai-resume-title">AI Resume Preview</h5>
                            </div>
                            <div className="ai-resume-body">
                                <h3>{aiResume.firstName} {aiResume.lastName}</h3>
                                <h5 className="text-muted-light">{aiResume.headline}</h5>
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
                                        {new Date(experience.startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        {" - "}
                                        {new Date(experience.endDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
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
                                        {new Date(education.startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        {" - "}
                                        {new Date(education.endDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

        <div className="profile-card">
            <div className="profile-card-body">
                <div className="profile-header">
                    <h5 className="profile-title">Profile Information</h5>
                    {!isEditingProfile && (
                        <button className="btn-edit-profile" onClick={handleEditProfileClick}>
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                <FeedbackMessage section="profile" />

                {isEditingProfile ? (
                    <>
                        <div className="form-group">
                            <label className="form-label">Headline</label>
                            <input
                                className="form-input"
                                placeholder="e.g., Senior Software Engineer, Marketing Specialist"
                                value={profile.headline}
                                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bio</label>
                            <textarea
                                className="form-textarea"
                                rows="4"
                                placeholder="Tell employers about yourself..."
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                className="form-input"
                                placeholder="e.g., Manila, Philippines"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                className="form-input"
                                placeholder="e.g., +63 912 345 6789"
                                value={profile.phoneNumber}
                                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleSaveProfile}>
                                Save Profile
                            </button>
                            <button className="btn-cancel" onClick={handleCancelProfile}>
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {profile.headline && <p><strong>Headline:</strong> {profile.headline}</p>}
                        {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
                        {profile.location && <p><strong>Location:</strong> {profile.location}</p>}
                        {profile.phoneNumber && <p><strong>Phone:</strong> {profile.phoneNumber}</p>}
                        {!profile.headline && !profile.bio && !profile.location && !profile.phoneNumber && (
                            <div className="empty-state-small">
                                <p className="text-muted-light">No profile information added yet.</p>
                                <button className="btn-primary-sm mt-2" onClick={handleEditProfileClick}>
                                    ✏️ Add Profile Information
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

        {aiResume && (
            <div className="ai-resume-card">
                <div className="ai-resume-card-header">
                    <h4>AI Generated Resume</h4>
                </div>
                <div className="ai-resume-card-body">
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

        <div className="section-header">
            <h2 className="section-title">Education</h2>
        </div>

        <FeedbackMessage section="education" />

        {isAddingEducation && (
            <div className="form-card">
                <div className="form-card-body">
                    <h5 className="form-card-title">Add New Education</h5>
                    <div className="form-group">
                        <label className="form-label">School Name</label>
                        <input
                            className="form-input"
                            placeholder="e.g., University Name"
                            value={educationForm.schoolName}
                            onChange={(e) => setEducationForm({ ...educationForm, schoolName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Degree</label>
                        <input
                            className="form-input"
                            placeholder="e.g., Bachelor of Science"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Field Of Study</label>
                        <input
                            className="form-input"
                            placeholder="e.g., Computer Science"
                            value={educationForm.fieldOfStudy}
                            onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group-half">
                            <label className="form-label">Start Date</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="YYYY-MM"
                                maxLength="7"
                                value={educationForm.startDate}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9-]/g, '');
                                    if (val.length === 4 && !val.includes('-')) {
                                        val = val + '-';
                                    }
                                    if (val.length > 7) val = val.substring(0, 7);
                                    setEducationForm({ ...educationForm, startDate: val });
                                }}
                                inputMode="numeric"
                            />
                            <small className="form-hint-text">Format: YYYY-MM</small>
                        </div>
                        <div className="form-group-half">
                            <label className="form-label">End Date</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="YYYY-MM"
                                maxLength="7"
                                value={educationForm.endDate}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9-]/g, '');
                                    if (val.length === 4 && !val.includes('-')) {
                                        val = val + '-';
                                    }
                                    if (val.length > 7) val = val.substring(0, 7);
                                    setEducationForm({ ...educationForm, endDate: val });
                                }}
                                inputMode="numeric"
                            />
                            <small className="form-hint-text">Format: YYYY-MM</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-success" onClick={handleAddEducation}>
                            Confirm Add
                        </button>
                        <button className="btn-cancel" onClick={handleCancelEducation}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {educations.length > 0 && (
            educations.map((education) => (
                <div key={education.educationId} className="item-card">
                    <div className="item-card-body">
                        {editingEducationId === education.educationId ? (
                            <>
                                <h5 className="item-card-title">Edit Education</h5>
                                <div className="form-group">
                                    <label className="form-label">School Name</label>
                                    <input
                                        className="form-input"
                                        value={editEducationForm.schoolName}
                                        onChange={(e) => setEditEducationForm({ ...editEducationForm, schoolName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Degree</label>
                                    <input
                                        className="form-input"
                                        value={editEducationForm.degree}
                                        onChange={(e) => setEditEducationForm({ ...editEducationForm, degree: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Field Of Study</label>
                                    <input
                                        className="form-input"
                                        value={editEducationForm.fieldOfStudy}
                                        onChange={(e) => setEditEducationForm({ ...editEducationForm, fieldOfStudy: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group-half">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="YYYY-MM"
                                            maxLength="7"
                                            value={editEducationForm.startDate}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/[^0-9-]/g, '');
                                                if (val.length === 4 && !val.includes('-')) {
                                                    val = val + '-';
                                                }
                                                if (val.length > 7) val = val.substring(0, 7);
                                                setEditEducationForm({ ...editEducationForm, startDate: val });
                                            }}
                                            inputMode="numeric"
                                        />
                                        <small className="form-hint-text">Format: YYYY-MM</small>
                                    </div>
                                    <div className="form-group-half">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="YYYY-MM"
                                            maxLength="7"
                                            value={editEducationForm.endDate}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/[^0-9-]/g, '');
                                                if (val.length === 4 && !val.includes('-')) {
                                                    val = val + '-';
                                                }
                                                if (val.length > 7) val = val.substring(0, 7);
                                                setEditEducationForm({ ...editEducationForm, endDate: val });
                                            }}
                                            inputMode="numeric"
                                        />
                                        <small className="form-hint-text">Format: YYYY-MM</small>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSaveEducation}>
                                        Save Changes
                                    </button>
                                    <button className="btn-cancel" onClick={handleCancelEducation}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="item-content">
                                <div>
                                    <h5 className="item-title">{education.degree}</h5>
                                    <p className="item-subtitle">{education.schoolName}</p>
                                    <p className="item-detail">{education.fieldOfStudy}</p>
                                    <p className="item-date">
                                        {new Date(education.startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        {" - "}
                                        {new Date(education.endDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-warning-sm" onClick={() => handleEditEducation(education)}>
                                        Edit
                                    </button>
                                    <button className="btn-danger-sm" onClick={() => handleDeleteEducation(education.educationId)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}

        {!isAddingEducation && (
            <div className="text-center mt-3">
                {educations.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-muted-light">No education added yet.</p>
                        <button className="btn-primary-sm mt-2" onClick={handleAddEducationClick}>
                            + Add Education
                        </button>
                    </div>
                ) : (
                    <button className="btn-add-dashed" onClick={handleAddEducationClick}>
                        + Add Education
                    </button>
                )}
            </div>
        )}

        <hr className="section-divider" />

        <div className="section-header">
            <h2 className="section-title">My Experience</h2>
        </div>

        <FeedbackMessage section="experience" />

        {isAddingExperience && (
            <div className="form-card">
                <div className="form-card-body">
                    <h5 className="form-card-title">Add New Experience</h5>
                    <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input
                            className="form-input"
                            placeholder="e.g., Company Name"
                            value={experienceForm.companyName}
                            onChange={(e) => setExperienceForm({ ...experienceForm, companyName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Job Title</label>
                        <input
                            className="form-input"
                            placeholder="e.g., Job Title"
                            value={experienceForm.jobTitle}
                            onChange={(e) => setExperienceForm({ ...experienceForm, jobTitle: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            rows="4"
                            placeholder="Describe your responsibilities and achievements..."
                            value={experienceForm.description}
                            onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group-half">
                            <label className="form-label">Start Date</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="YYYY-MM"
                                maxLength="7"
                                value={experienceForm.startDate}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9-]/g, '');
                                    if (val.length === 4 && !val.includes('-')) {
                                        val = val + '-';
                                    }
                                    if (val.length > 7) val = val.substring(0, 7);
                                    setExperienceForm({ ...experienceForm, startDate: val });
                                }}
                                inputMode="numeric"
                            />
                            <small className="form-hint-text">Format: YYYY-MM</small>
                        </div>
                        <div className="form-group-half">
                            <label className="form-label">End Date</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="YYYY-MM"
                                maxLength="7"
                                value={experienceForm.endDate}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9-]/g, '');
                                    if (val.length === 4 && !val.includes('-')) {
                                        val = val + '-';
                                    }
                                    if (val.length > 7) val = val.substring(0, 7);
                                    setExperienceForm({ ...experienceForm, endDate: val });
                                }}
                                inputMode="numeric"
                            />
                            <small className="form-hint-text">Format: YYYY-MM</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-success" onClick={handleSaveExperience}>
                            Confirm Add
                        </button>
                        <button className="btn-cancel" onClick={handleCancelExperience}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {experiences.length > 0 && (
            experiences.map(experience => (
                <div key={experience.experienceId} className="item-card">
                    <div className="item-card-body">
                        {editingExperienceId === experience.experienceId ? (
                            <>
                                <h5 className="item-card-title">Edit Experience</h5>
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input
                                        className="form-input"
                                        value={experienceForm.companyName}
                                        onChange={(e) => setExperienceForm({ ...experienceForm, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Job Title</label>
                                    <input
                                        className="form-input"
                                        value={experienceForm.jobTitle}
                                        onChange={(e) => setExperienceForm({ ...experienceForm, jobTitle: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="4"
                                        value={experienceForm.description}
                                        onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group-half">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="YYYY-MM"
                                            maxLength="7"
                                            value={experienceForm.startDate}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/[^0-9-]/g, '');
                                                if (val.length === 4 && !val.includes('-')) {
                                                    val = val + '-';
                                                }
                                                if (val.length > 7) val = val.substring(0, 7);
                                                setExperienceForm({ ...experienceForm, startDate: val });
                                            }}
                                            inputMode="numeric"
                                        />
                                        <small className="form-hint-text">Format: YYYY-MM</small>
                                    </div>
                                    <div className="form-group-half">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="YYYY-MM"
                                            maxLength="7"
                                            value={experienceForm.endDate}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/[^0-9-]/g, '');
                                                if (val.length === 4 && !val.includes('-')) {
                                                    val = val + '-';
                                                }
                                                if (val.length > 7) val = val.substring(0, 7);
                                                setExperienceForm({ ...experienceForm, endDate: val });
                                            }}
                                            inputMode="numeric"
                                        />
                                        <small className="form-hint-text">Format: YYYY-MM</small>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSaveExperience}>
                                        Save Changes
                                    </button>
                                    <button className="btn-cancel" onClick={handleCancelExperience}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="item-content">
                                <div>
                                    <h5 className="item-title">{experience.jobTitle}</h5>
                                    <p className="item-subtitle">{experience.companyName}</p>
                                    <p className="item-detail">{experience.description}</p>
                                    <p className="item-date">
                                        <strong>Start:</strong> {new Date(experience.startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="item-date">
                                        <strong>End:</strong> {new Date(experience.endDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-warning-sm" onClick={() => handleEditExperience(experience)}>
                                        Edit
                                    </button>
                                    <button className="btn-danger-sm" onClick={() => handleDeleteExperience(experience.experienceId)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}

        {!isAddingExperience && (
            <div className="text-center mt-3">
                {experiences.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-muted-light">No experience added yet.</p>
                        <button className="btn-primary-sm mt-2" onClick={handleAddExperienceClick}>
                            + Add Experience
                        </button>
                    </div>
                ) : (
                    <button className="btn-add-dashed" onClick={handleAddExperienceClick}>
                        + Add Experience
                    </button>
                )}
            </div>
        )}

        <hr className="section-divider" />

        <div className="section-header">
            <h2 className="section-title">My Skills</h2>
        </div>

        <FeedbackMessage section="skill" />

        {isAddingSkill && (
            <div className="form-card">
                <div className="form-card-body">
                    <h5 className="form-card-title">Add New Skill</h5>
                    <div className="form-group">
                        <label className="form-label">Skill Name</label>
                        <input
                            className="form-input"
                            placeholder="e.g., JavaScript, Python, Project Management"
                            value={skillForm.skillName}
                            onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                        />
                        <small className="form-hint-text">Add one skill at a time</small>
                    </div>
                    <div className="form-actions">
                        <button className="btn-success" onClick={handleSaveSkill}>
                            Confirm Add
                        </button>
                        <button className="btn-cancel" onClick={handleCancelSkill}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {skills.length > 0 && (
            skills.map(skill => (
                <div key={skill.skillId} className="item-card">
                    <div className="item-card-body">
                        {editingSkillId === skill.skillId ? (
                            <div className="skill-edit-row">
                                <input
                                    className="form-input"
                                    value={skillForm.skillName}
                                    onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                                    style={{ maxWidth: '300px' }}
                                />
                                <div className="skill-edit-actions">
                                    <button className="btn-primary-sm" onClick={handleSaveSkill}>
                                        Save
                                    </button>
                                    <button className="btn-cancel" onClick={handleCancelSkill}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="item-content">
                                <h5 className="item-title">{skill.skillName}</h5>
                                <div className="item-actions">
                                    <button className="btn-warning-sm" onClick={() => handleEditSkill(skill)}>
                                        Edit
                                    </button>
                                    <button className="btn-danger-sm" onClick={() => handleDeleteSkill(skill.skillId)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}

        {!isAddingSkill && (
            <div className="text-center mt-3">
                {skills.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-muted-light">No skills added yet.</p>
                        <button className="btn-primary-sm mt-2" onClick={handleAddSkillClick}>
                            + Add Skill
                        </button>
                    </div>
                ) : (
                    <button className="btn-add-dashed" onClick={handleAddSkillClick}>
                        + Add Skill
                    </button>
                )}
            </div>
        )}

        <div className="section-header mt-5">
            <h2 className="section-title">My Applications</h2>
        </div>

        {applications.length === 0 ? (
            <div className="empty-state-large">
                <h4>No Applications Yet</h4>
                <p className="text-muted-light">Start applying to jobs and track your application progress here.</p>
                <Link to="/" className="btn-primary">
                    Browse Available Jobs
                </Link>
            </div>
        ) : (
            applications.map(application => (
                <div key={application.applicationId} className="application-card">
                    <div className="application-card-body">
                        <div className="application-header">
                            <div>
                                <h3 className="application-title">{application.job.title}</h3>
                                <p className="application-location">{application.job.location}</p>
                            </div>
                            <span className={`status-badge ${application.status === "Hired" ? "status-hired" : application.status === "Interview" ? "status-interview" : application.status === "Rejected" ? "status-rejected" : application.status === "Pending" ? "status-pending" : application.status === "Screening" ? "status-screening" : application.status === "Technical Exam" ? "status-technical" : application.status === "Offer" ? "status-offer" : "status-default"}`}>
                                {application.status}
                            </span>
                        </div>
                        <hr className="application-divider" />
                        <div className="application-details">
                            <div>
                                <strong>Employment</strong>
                                <p>{application.job.employmentType}</p>
                            </div>
                            <div>
                                <strong>Salary</strong>
                                <p>₱{application.job.salary.toLocaleString()}</p>
                            </div>
                            <div>
                                <strong>Applied</strong>
                                <p>{new Date(application.appliedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
);

}
export default EmployeeDashboard;