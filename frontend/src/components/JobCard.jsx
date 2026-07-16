import { Link } from "react-router-dom";

function JobCard({ job }) {
    return (
        <div className="card mb-3">

            <div className="card-body">

                <h4>{job.title}</h4>

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

                <Link
                    to={`/jobs/${job.jobPostId}`}
                    className="btn btn-primary mt-3"
                >
                    View Details
                </Link>

            </div>

        </div>
    );
}

export default JobCard;