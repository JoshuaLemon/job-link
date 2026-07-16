import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function JobDetails() {

    const { id } = useParams();

    const [job, setJob] = useState(null);

    useEffect(() => {

        api.get(`/JobPost/${id}`)
            .then((response) => {

                console.log(response.data);

                setJob(response.data);

            })
            .catch((error) => {

                console.error(error);

            });

    }, [id]);

    const handleApply = async () => {

        try {

            await api.post(
                "/Application",
                {
                    jobPostId: job.jobPostId
                }
            );

            alert("Application submitted successfully.");

        }
        catch (error) {

            console.error(error);

            if (error.response) {

                alert(error.response.data);

            }
            else {

                alert("Unable to apply.");

            }

        }

    };

    if (!job) {

        return (

            <div className="container mt-5">

                Loading...

            </div>

        );

    }

    return (

        <div className="container mt-5">

            <div className="card">

                <div className="card-body">

                    <h2>{job.title}</h2>

                    <p>{job.description}</p>

                    <p>

                        <strong>Location:</strong>{" "}

                        {job.location}

                    </p>

                    <p>

                        <strong>Employment:</strong>{" "}

                        {job.employmentType}

                    </p>

                    <p>

                        <strong>Salary:</strong>{" "}

                        ₱{job.salary}

                    </p>

                    <button
                        className="btn btn-success mt-3"
                        onClick={handleApply}
                    >
                        Apply Now
                    </button>

                </div>

            </div>

        </div>

    );

}

export default JobDetails;