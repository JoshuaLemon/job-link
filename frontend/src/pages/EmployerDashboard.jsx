import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function EmployerDashboard() {

    const [jobs, setJobs] = useState([]);

    const [editingJobId, setEditingJobId] = useState(null);

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        location: "",
        salary: 0,
        employmentType: ""
    });

    const [stats, setStats] = useState({
        jobsPosted: 0,
        totalApplicants: 0,
        pending: 0,
        interviews: 0,
        hired: 0
    });

    useEffect(() => {

        api.get("/JobPost/my-jobs")
            .then((response) => {

                console.log(response.data);

                setJobs(response.data);

            })
            .catch((error) => {

                console.error(error);

            });
        api.get("/Application/dashboard")

            .then((response) => {

                console.log(response.data);

                setStats(response.data);

            })

            .catch((error) => {

                console.error(error);

            });
    }, []);

    const handleEdit = (job) => {

        setEditingJobId(job.jobPostId);

        setEditForm({
            title: job.title,
            description: job.description,
            location: job.location,
            salary: job.salary,
            employmentType: job.employmentType
        });

    };

    const handleSave = async () => {

        try {

            await api.put(

                `/JobPost/${editingJobId}`,

                editForm

            );

            setJobs(previousJobs =>

                previousJobs.map(job =>

                    job.jobPostId === editingJobId

                        ? {
                            ...job,
                            ...editForm
                        }

                        : job

                )

            );

            setEditingJobId(null);

            alert("Job updated successfully.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to update job.");

        }

    };

    const handleDelete = async (jobId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this job?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(`/JobPost/${jobId}`);

            setJobs(previousJobs =>
                previousJobs.filter(job =>
                    job.jobPostId !== jobId
                )
            );

            alert("Job deleted successfully.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to delete job.");

        }

    };

    
    return (

        <div className="container mt-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="row mb-4">

                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6>Jobs Posted</h6>
                            <h2>{stats.jobsPosted}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6>Total Applicants</h6>
                            <h2>{stats.totalApplicants}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6>Pending</h6>
                            <h2>{stats.pending}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6>Interviews</h6>
                            <h2>{stats.interviews}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6>Hired</h6>
                            <h2>{stats.hired}</h2>
                        </div>
                    </div>
                </div>

            </div>
                <h2>
                    Employer Dashboard
                </h2>

                <Link
                    to="/create-job"
                    className="btn btn-primary"
                >
                    + Create Job
                </Link>

            </div>

            {jobs.length === 0 ? (

                <p>You haven't posted any jobs yet.</p>

            ) : (

                jobs.map(job => (

                    <div
                        key={job.jobPostId}
                        className="card mb-3"
                    >

                        <div className="card-body">

                            {editingJobId === job.jobPostId ? (

                                <>

                                    <div className="mb-3">

                                        <label>Title</label>

                                        <input
                                            className="form-control"
                                            value={editForm.title}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    title: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                    <div className="mb-3">

                                        <label>Description</label>

                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={editForm.description}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    description: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                    <div className="mb-3">

                                        <label>Location</label>

                                        <input
                                            className="form-control"
                                            value={editForm.location}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    location: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                    <div className="mb-3">

                                        <label>Salary</label>

                                        <input
                                            className="form-control"
                                            type="number"
                                            value={editForm.salary}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    salary: Number(e.target.value)
                                                })
                                            }
                                        />

                                    </div>

                                    <div className="mb-3">

                                        <label>Employment Type</label>

                                        <input
                                            className="form-control"
                                            value={editForm.employmentType}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    employmentType: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                    <button
                                        className="btn btn-success me-2"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setEditingJobId(null)}
                                    >
                                        Cancel
                                    </button>

                                </>

                            ) : (

                                <>

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

                                    <div className="mt-3">

                                        <button
                                            className="btn btn-warning me-2"
                                            onClick={() => handleEdit(job)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(job.jobPostId)}
                                        >
                                            Delete
                                        </button>

                                        <Link
                                            to={`/applicants/${job.jobPostId}`}
                                            className="btn btn-info ms-2"
                                        >
                                            View Applicants
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default EmployerDashboard;