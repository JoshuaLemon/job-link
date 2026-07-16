import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function EmployerViewProfile() {

    const { id } = useParams();
    console.log("Profile ID from URL:", id);
    const [profile, setProfile] = useState(null);

   useEffect(() => {

        console.log("Route ID:", id);

        api.get(`/Profile/employee/${id}`)

            .then((response) => {

                console.log("API Response:", response.data);

                setProfile(response.data);

            })

            .catch((error) => {

                console.error(error);

            });

    }, [id]);

    if (!profile) {

        return (

            <div className="container mt-5">

                Loading...

            </div>

        );

    }

    return (

        <div className="container mt-5">

            <div className="card mb-4">

                <div className="card-body">

                    <h2>

                        {profile.firstName} {profile.lastName}

                    </h2>

                    <h5 className="text-muted">

                        {profile.headline}

                    </h5>

                    <p>

                        {profile.bio}

                    </p>

                    <p>

                        <strong>Email:</strong>{" "}

                        {profile.email}

                    </p>

                    <p>

                        <strong>Location:</strong>{" "}

                        {profile.location}

                    </p>

                    <p>

                        <strong>Phone:</strong>{" "}

                        {profile.phoneNumber}

                    </p>

                </div>

            </div>

            <div className="card mb-4">

                <div className="card-body">

                    <h3>

                        Education

                    </h3>

                    {!profile.educations || profile.educations.length === 0 ? (

                        <p>No education added.</p>

                    ) : (

                        profile.educations.map(education => (

                            <div
                                key={education.educationId}
                                className="mb-4"
                            >

                                <h5>

                                    {education.schoolName}

                                </h5>

                                <p className="mb-1">

                                    <strong>

                                        {education.degree}

                                    </strong>

                                </p>

                                <p className="mb-1">

                                    {education.fieldOfStudy}

                                </p>

                                <small className="text-muted">

                                    {new Date(education.startDate).toLocaleDateString()} -{" "}

                                    {new Date(education.endDate).toLocaleDateString()}

                                </small>

                            </div>

                        ))

                    )}

                </div>

            </div>

            <div className="card mb-4">

                <div className="card-body">

                    <h3>

                        Experience

                    </h3>

                    {!profile.experiences || profile.experiences.length === 0 ? (

                        <p>No experience added.</p>

                    ) : (

                        profile.experiences.map(experience => (

                            <div
                                key={experience.experienceId}
                                className="mb-4"
                            >

                                <h5>

                                    {experience.companyName}

                                </h5>

                                <p className="mb-1">

                                    <strong>

                                        {experience.jobTitle}

                                    </strong>

                                </p>

                                <p>

                                    {experience.description}

                                </p>

                                <small className="text-muted">

                                    {new Date(experience.startDate).toLocaleDateString()} -{" "}

                                    {new Date(experience.endDate).toLocaleDateString()}

                                </small>

                            </div>

                        ))

                    )}

                </div>

            </div>

            <div className="card">

                <div className="card-body">

                    <h3>

                        Skills

                    </h3>

                    {!profile.skills || profile.skills.length === 0 ? (

                        <p>No skills added.</p>

                    ) : (

                        <div>

                            {profile.skills.map(skill => (

                                <span
                                    key={skill.skillId}
                                    className="badge bg-primary me-2 mb-2"
                                >

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