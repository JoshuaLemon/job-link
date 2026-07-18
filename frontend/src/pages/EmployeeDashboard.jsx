import { useEffect, useState } from "react";
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

    const [experienceForm, setExperienceForm] = useState({
        companyName: "",
        jobTitle: "",
        description: "",
        startDate: "",
        endDate: ""
    });

    const [skills, setSkills] = useState([]);

    const [skillForm, setSkillForm] = useState({
        skillName: ""
    });

    const [editingSkillId, setEditingSkillId] = useState(null);

    const [editingExperienceId, setEditingExperienceId] = useState(null);

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

                await api.put(

                    `/Profile/${user.userId}`,

                    request

                );

            }
            else {

                await api.post(

                    "/Profile",

                    request

                );

                setProfileExists(true);
                setEmployeeProfileId(response.data.employeeProfileId);
                
            }
            alert("Profile saved successfully.");
        }
        catch (error) {

            console.error(error);

            alert("Unable to save profile.");

        }

    };

    const handleAddEducation = async () => {

            if (!employeeProfileId) {

                alert("Please save your profile first.");

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

                const response = await api.post(

                    "/Education",

                    request

                );

                setEducations(prev => [
                    ...prev,
                    response.data.education
                ]);

                setEducationForm({

                    schoolName: "",

                    degree: "",

                    fieldOfStudy: "",

                    startYear: "",

                    endYear: ""

                });

                alert("Education added successfully.");

            }
            catch (error) {

                console.error(error);

                alert("Unable to add education.");

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

                await api.put(

                    `/Education/${editingEducationId}`,

                    request

                );

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

                alert("Education updated successfully.");

            }

            catch (error) {

                console.error(error);

                alert("Unable to update education.");

            }

    };
    const handleDeleteEducation = async (educationId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this education?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(`/Education/${educationId}`);

            setEducations(

                educations.filter(

                    education => education.educationId !== educationId

                )

            );

            alert("Education deleted successfully.");

        }

        catch (error) {

            console.error(error);

            alert("Unable to delete education.");

        }

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

                await api.post(
                    "/Experience",
                    request
                );

            }
            else {

                await api.put(
                    `/Experience/${editingExperienceId}`,
                    request
                );

            }

            const response = await api.get(
                "/Experience/my-experience"
            );

            setExperiences(response.data);

            setExperienceForm({
                companyName: "",
                jobTitle: "",
                description: "",
                startDate: "",
                endDate: ""
            });

            setEditingExperienceId(null);

            alert("Experience saved successfully.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to save experience.");

        }

    };

  

    const handleEditExperience = (experience) => {

        setEditingExperienceId(
            experience.experienceId
        );

        setExperienceForm({

            companyName: experience.companyName,

            jobTitle: experience.jobTitle,

            description: experience.description,

            startDate: experience.startDate.substring(0, 10),

            endDate: experience.endDate.substring(0, 10)

        });

    };


    const handleDeleteExperience = async (experienceId) => {

        const confirmed = window.confirm(
            "Delete this experience?"
        );

        if (!confirmed) {

            return;

        }

        try {

            await api.delete(
                `/Experience/${experienceId}`
            );

            setExperiences(previous =>
                previous.filter(x =>
                    x.experienceId !== experienceId
                )
            );

            alert("Experience deleted.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to delete experience.");

        }

    };
  const handleSaveSkill = async () => {

        try {

            const request = {

                employeeProfileId: employeeProfileId,

                skillName: skillForm.skillName

            };

            if (editingSkillId === null) {

                await api.post(
                    "/Skill",
                    request
                );

            }
            else {

                await api.put(
                    `/Skill/${editingSkillId}`,
                    request
                );

            }

            const response = await api.get(
                "/Skill/my-skills"
            );

            setSkills(response.data);

            setSkillForm({
                skillName: ""
            });

            setEditingSkillId(null);

            alert("Skill saved successfully.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to save skill.");

        }

    };

    const handleEditSkill = (skill) => {

        setEditingSkillId(
            skill.skillId
        );

        setSkillForm({

            skillName: skill.skillName

        });

    };

    const handleDeleteSkill = async (skillId) => {

        const confirmed = window.confirm(
            "Delete this skill?"
        );

        if (!confirmed) {

            return;

        }

        try {

            await api.delete(
                `/Skill/${skillId}`
            );

            setSkills(previous =>
                previous.filter(skill =>
                    skill.skillId !== skillId
                )
            );

            alert("Skill deleted.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to delete skill.");

        }

    };
    const downloadResume = async () => {

        try {

            const response = await api.get(

                `/Profile/resume-pdf/${user.userId}`,

                {
                    responseType: "blob"
                }

            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.download = "Resume.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        }
        catch (error) {

            console.error(error);

            alert("Unable to download resume.");

        }
    };
    const generateAIResume = async () => {

        try {

            setLoadingAI(true);

            const response = await api.post(
                "/AI/generate-resume"
            );

            setAIResume(response.data);  
            setHasGenerated(true);

        }
        catch (err) {

            console.error(err);
            alert("Failed to generate AI resume.");

        }
        finally {

            setLoadingAI(false);

        }
    };
    async function downloadAIResume() {

        try {

            const response = await api.post(
                "/resume/download-ai",
                aiResume,
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;
            link.download = "AI_Resume.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

        }
        catch (err) {

            console.error(err);

            alert("Failed to download AI Resume.");

        }

    }

    return (

        <div className="container mt-5">

           <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>My Profile</h2>

                <div>

                    <button
                        className="btn btn-success me-2"
                        onClick={downloadResume}
                    >
                        📄 Download Resume
                    </button>

                    <button
                            className="btn btn-primary"
                            onClick={generateAIResume}
                            disabled={loadingAI}
                        >

                            {loadingAI
                                ? "Generating..."
                                : "✨ Generate with AI"}

                    </button>
            {hasGenerated && (
                <>
                    <button
                        className="btn btn-success ms-2"
                        onClick={downloadAIResume}
                    >
                        📄 Download AI Resume
                    </button>

                    <div className="card mt-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                AI Resume Preview
                            </h5>
                        </div>

                        <div className="card-body">

                            <h3>
                                {aiResume.firstName} {aiResume.lastName}
                            </h3>

                            <h5 className="text-muted">
                                {aiResume.headline}
                            </h5>

                            <p>
                                <strong>Email:</strong> {aiResume.email}
                            </p>

                            <p>
                                <strong>Phone:</strong> {aiResume.phoneNumber}
                            </p>

                            <p>
                                <strong>Location:</strong> {aiResume.location}
                            </p>

                            <hr />

                            <h5>Professional Summary</h5>

                            <p>
                                {aiResume.bio}
                            </p>

                            <hr />

                            <h5>Skills</h5>

                            <ul>

                                {aiResume.skills.map((skill, index) => (

                                    <li key={index}>
                                        {skill}
                                    </li>

                                ))}

                            </ul>

                            <hr />

                            <h5>Experience</h5>

                            {aiResume.experiences.map((experience, index) => (

                                <div key={index} className="mb-3">

                                    <strong>
                                        {experience.jobTitle}
                                    </strong>

                                    <br />

                                    {experience.companyName}

                                    <br />

                                    {new Date(experience.startDate).getFullYear()}
                                    {" - "}
                                    {new Date(experience.endDate).getFullYear()}

                                    <p>
                                        {experience.description}
                                    </p>

                                </div>

                            ))}

                            <hr />

                            <h5>Education</h5>

                            {aiResume.educations.map((education, index) => (

                                <div key={index} className="mb-3">

                                    <strong>
                                        {education.schoolName}
                                    </strong>

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
      
            <div className="card mb-5">

                <div className="card-body">

                    <div className="mb-3">

                        <label className="form-label">

                            Headline

                        </label>

                        <input
                            className="form-control"
                            value={profile.headline}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    headline: e.target.value
                                })
                            }
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">

                            Bio

                        </label>

                        <textarea
                            className="form-control"
                            rows="4"
                            value={profile.bio}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    bio: e.target.value
                                })
                            }
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">

                            Location

                        </label>

                        <input
                            className="form-control"
                            value={profile.location}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    location: e.target.value
                                })
                            }
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">

                            Phone Number

                        </label>

                        <input
                            className="form-control"
                            value={profile.phoneNumber}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    phoneNumber: e.target.value
                                })
                            }
                        />

                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                    >
                        Save Profile
                    </button>

                </div>

            </div>

            {aiResume && (

            <div className="card mb-5">

                <div className="card-header">

                    <h4>AI Generated Resume</h4>

                </div>

                <div className="card-body">

                <h2>
                    {aiResume.firstName} {aiResume.lastName}
                </h2>

                <p>
                    <strong>{aiResume.headline}</strong>
                </p>

                <p>
                    {aiResume.email}
                </p>

                <p>
                    {aiResume.phoneNumber}
                </p>

                <p>
                    {aiResume.location}
                </p>

                <hr />

                <h5>Professional Summary</h5>

                <p>{aiResume.bio}</p>

                <hr />

                <h5>Skills</h5>

                <ul>

                    {aiResume.skills.map(skill => (

                        <li key={skill}>
                            {skill}
                        </li>

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

            <h2 className="mb-4">

                Education

            </h2>

            <div className="card mb-4">

                <div className="card-body">

                    <div className="mb-3">

                        <label className="form-label">

                            School Name

                        </label>

                        <input
                            className="form-control"
                            value={educationForm.schoolName}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    schoolName: e.target.value
                                })
                            }
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">

                            Degree

                        </label>

                        <input
                            className="form-control"
                            value={educationForm.degree}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    degree: e.target.value
                                })
                            }
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">

                            Field Of Study

                        </label>

                        <input
                            className="form-control"
                            value={educationForm.fieldOfStudy}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    fieldOfStudy: e.target.value
                                })
                            }
                        />

                    </div>

                    <div className="row">

                        <div className="col">

                            <label className="form-label">

                                Start Year

                            </label>

                            <input
                                className="form-control"
                                type="number"
                                value={educationForm.startYear}
                                onChange={(e) =>
                                    setEducationForm({
                                        ...educationForm,
                                        startYear: e.target.value
                                    })
                                }
                            />

                        </div>

                        <div className="col">

                            <label className="form-label">

                                End Year

                            </label>

                            <input
                                className="form-control"
                                type="number"
                                value={educationForm.endYear}
                                onChange={(e) =>
                                    setEducationForm({
                                        ...educationForm,
                                        endYear: e.target.value
                                    })
                                }
                            />

                        </div>

                    </div>

                    <button
                        className="btn btn-success mt-3"
                        onClick={handleAddEducation}
                    >
                        Add Education
                    </button>

                </div>

            </div>

            {educations.map((education) => (

            <div
                key={education.educationId}
                className="card mb-3"
            >

                <div className="card-body">

                    {editingEducationId === education.educationId ? (

                        <>

                            <div className="mb-3">

                                <label>School Name</label>

                                <input
                                    className="form-control"
                                    value={editEducationForm.schoolName}
                                    onChange={(e) =>
                                        setEditEducationForm({
                                            ...editEducationForm,
                                            schoolName: e.target.value
                                        })
                                    }
                                />

                            </div>

                            <div className="mb-3">

                                <label>Degree</label>

                                <input
                                    className="form-control"
                                    value={editEducationForm.degree}
                                    onChange={(e) =>
                                        setEditEducationForm({
                                            ...editEducationForm,
                                            degree: e.target.value
                                        })
                                    }
                                />

                            </div>

                            <div className="mb-3">

                                <label>Field Of Study</label>

                                <input
                                    className="form-control"
                                    value={editEducationForm.fieldOfStudy}
                                    onChange={(e) =>
                                        setEditEducationForm({
                                            ...editEducationForm,
                                            fieldOfStudy: e.target.value
                                        })
                                    }
                                />

                            </div>

                            <div className="row">

                                <div className="col">

                                    <label>Start Year</label>

                                    <input
                                        className="form-control"
                                        type="number"
                                        value={editEducationForm.startYear}
                                        onChange={(e) =>
                                            setEditEducationForm({
                                                ...editEducationForm,
                                                startYear: e.target.value
                                            })
                                        }
                                    />

                                </div>

                                <div className="col">

                                    <label>End Year</label>

                                    <input
                                        className="form-control"
                                        type="number"
                                        value={editEducationForm.endYear}
                                        onChange={(e) =>
                                            setEditEducationForm({
                                                ...editEducationForm,
                                                endYear: e.target.value
                                            })
                                        }
                                    />

                                </div>

                            </div>

                            <button
                                className="btn btn-success mt-3 me-2"
                                onClick={handleSaveEducation}
                            >
                                Save
                            </button>

                            <button
                                className="btn btn-secondary mt-3"
                                onClick={() => setEditingEducationId(null)}
                            >
                                Cancel
                            </button>

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

        ))}


    <hr className="my-5" />

    <h2 className="mb-4">
        My Experience
    </h2>

    <div className="card mb-4">

        <div className="card-body">

            <div className="mb-3">

                <label className="form-label">
                    Company Name
                </label>

                <input
                    className="form-control"
                    value={experienceForm.companyName}
                    onChange={(e) =>
                        setExperienceForm({
                            ...experienceForm,
                            companyName: e.target.value
                        })
                    }
                />

            </div>

            <div className="mb-3">

                <label className="form-label">
                    Job Title
                </label>

                <input
                    className="form-control"
                    value={experienceForm.jobTitle}
                    onChange={(e) =>
                        setExperienceForm({
                            ...experienceForm,
                            jobTitle: e.target.value
                        })
                    }
                />

            </div>

            <div className="mb-3">

                <label className="form-label">
                    Description
                </label>

                <textarea
                    className="form-control"
                    rows="4"
                    value={experienceForm.description}
                    onChange={(e) =>
                        setExperienceForm({
                            ...experienceForm,
                            description: e.target.value
                        })
                    }
                />

            </div>

            <div className="row">

                <div className="col-md-6">

                    <label className="form-label">
                        Start Date
                    </label>

                    <input
                        type="date"
                        className="form-control"
                        value={experienceForm.startDate}
                        onChange={(e) =>
                            setExperienceForm({
                                ...experienceForm,
                                startDate: e.target.value
                            })
                        }
                    />

                </div>

                <div className="col-md-6">

                    <label className="form-label">
                        End Date
                    </label>

                    <input
                        type="date"
                        className="form-control"
                        value={experienceForm.endDate}
                        onChange={(e) =>
                            setExperienceForm({
                                ...experienceForm,
                                endDate: e.target.value
                            })
                        }
                    />

                </div>

            </div>

            <button
                className="btn btn-primary mt-3"
                onClick={handleSaveExperience}
            >
                {
                    editingExperienceId === null
                        ? "Add Experience"
                        : "Update Experience"
                }
            </button>

        </div>

    </div>

    {experiences.length === 0 ? (

        <p>
            No experience added yet.
        </p>

    ) : (

        experiences.map(experience => (

            <div
                key={experience.experienceId}
                className="card mb-3"
            >

                <div className="card-body">

                    <h5>

                        {experience.jobTitle}

                    </h5>

                    <h6 className="text-muted">

                        {experience.companyName}

                    </h6>

                    <p>

                        {experience.description}

                    </p>

                    <p>

                        <strong>Start:</strong>{" "}

                        {new Date(
                            experience.startDate
                        ).toLocaleDateString()}

                    </p>

                    <p>

                        <strong>End:</strong>{" "}

                        {new Date(
                            experience.endDate
                        ).toLocaleDateString()}

                    </p>

                    <button
                        className="btn btn-warning me-2"
                        onClick={() =>
                            handleEditExperience(experience)
                        }
                    >
                        Edit
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={() =>
                            handleDeleteExperience(
                                experience.experienceId
                            )
                        }
                    >
                        Delete
                    </button>

                </div>

            </div>

        ))

    )}

    <hr className="my-5" />

    <h2 className="mb-4">
        My Skills
    </h2>

    <div className="card mb-4">

        <div className="card-body">

            <div className="mb-3">

                <label className="form-label">

                    Skill Name

                </label>

                <input
                    className="form-control"
                    value={skillForm.skillName}
                    onChange={(e) =>
                        setSkillForm({
                            ...skillForm,
                            skillName: e.target.value
                        })
                    }
                />

            </div>

            <button
                className="btn btn-primary"
                onClick={handleSaveSkill}
            >
                {
                    editingSkillId === null
                        ? "Add Skill"
                        : "Update Skill"
                }
            </button>

        </div>

    </div>


    {skills.length === 0 ? (

        <p>

            No skills added yet.

        </p>

    ) : (

        skills.map(skill => (

            <div
                key={skill.skillId}
                className="card mb-3"
            >

                <div className="card-body d-flex justify-content-between align-items-center">

                    <h5 className="mb-0">

                        {skill.skillName}

                    </h5>

                    <div>

                        <button
                            className="btn btn-warning me-2"
                            onClick={() =>
                                handleEditSkill(skill)
                            }
                        >
                            Edit
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={() =>
                                handleDeleteSkill(
                                    skill.skillId
                                )
                            }
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        ))

    )}
            <h2 className="mb-4">

                My Applications

            </h2>

            {applications.length === 0 ? (

                <p>

                    You haven't applied for any jobs yet.

                </p>

            ) : (

                applications.map(application => (

                    <div
                        key={application.applicationId}
                        className="card mb-3"
                    >

                        <div className="card-body">

                            <h4>

                                {application.job.title}

                            </h4>

                            <p>

                                <strong>Location:</strong>{" "}

                                {application.job.location}

                            </p>

                            <p>

                                <strong>Employment:</strong>{" "}

                                {application.job.employmentType}

                            </p>

                            <p>

                                <strong>Salary:</strong>{" "}

                                ₱{application.job.salary}

                            </p>

                            <p>

                                <strong>Applied:</strong>{" "}

                                {new Date(
                                    application.appliedAt
                                ).toLocaleDateString()}

                            </p>

                        </div>

                    </div>

                ))

            )}

        </div>

    );

}

export default EmployeeDashboard;