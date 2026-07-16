import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function Applicants() {

    const { id } = useParams();

    const [applicants, setApplicants] = useState([]);

    useEffect(() => {

        api.get(`/Application/job/${id}`)

            .then((response) => {

                console.log(response.data);

                setApplicants(response.data);

            })

            .catch((error) => {

                console.error(error);

            });

    }, [id]);

    const updateStatus = async (applicationId, status) => {

        try {

            await api.put(

                `/Application/${applicationId}/status`,

                {
                    status
                }

            );

            setApplicants(previous =>

                previous.map(app =>

                    app.applicationId === applicationId

                        ? {
                            ...app,
                            status
                        }

                        : app

                )

            );

            alert("Application status updated.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to update status.");

        }

    };

    return (

        <div className="container mt-5">

            <h2 className="mb-4">

                Applicants

            </h2>

            {applicants.length === 0 ? (

                <p>No applicants yet.</p>

            ) : (

                applicants.map(application => (

                    <div
                        key={application.applicationId}
                        className="card mb-3"
                    >

                        <div className="card-body">

                            <h4>

                                {application.applicant.firstName}{" "}
                                {application.applicant.lastName}

                            </h4>

                            <p>

                                <strong>Headline:</strong>{" "}

                                {application.applicant.headline}

                            </p>

                            <p>

                                <strong>Location:</strong>{" "}

                                {application.applicant.location}

                            </p>

                            <p>

                                <strong>Applied:</strong>{" "}

                                {new Date(
                                    application.appliedAt
                                ).toLocaleDateString()}

                            </p>

                            <div className="mb-3">

                                <label className="form-label">

                                    Application Status

                                </label>

                                <select

                                    className="form-select w-auto"

                                    value={application.status}

                                    onChange={(e) =>
                                        updateStatus(
                                            application.applicationId,
                                            e.target.value
                                        )
                                    }

                                >

                                    <option>Pending</option>

                                    <option>Screening</option>

                                    <option>Interview</option>

                                    <option>Technical Exam</option>

                                    <option>Offer</option>

                                    <option>Hired</option>

                                    <option>Rejected</option>

                                </select>

                            </div>

                            <div className="mt-3">

                                <Link
                                    to={`/employee-profile/${application.applicant.employeeProfileId}`}
                                    className="btn btn-primary me-2"
                                >
                                    View Full Profile
                                </Link>

                            </div>

                        </div>

                    </div>

                ))

            )}

        </div>

    );

}

export default Applicants;