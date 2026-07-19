import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function EmployerDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));
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

    const [companyExists, setCompanyExists] = useState(false);

    const [companyId, setCompanyId] = useState(null);

    const [company, setCompany] = useState({

        companyName: "",

        industry: "",

        description: "",

        website: "",

        location: ""

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

            api.get(`/Company/${user.userId}`)

    .then((response) => {

        console.log(response.data);

        setCompanyExists(true);

        setCompanyId(response.data.companyId);

        setCompany({

            companyName: response.data.companyName,

            industry: response.data.industry,

            description: response.data.description,

            website: response.data.website,

            location: response.data.location

        });

    })

    .catch(() => {

        console.log("No company found.");

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

    const handleSaveCompany = async () => {

        try {

        const request = {

            userId: user.userId,

            companyName: company.companyName,

            industry: company.industry,

            description: company.description,

            website: company.website,

            location: company.location

        };

            if (companyExists) {

                await api.put(

                    `/Company/${user.userId}`,

                    request

                );

            }
            else {

                const response = await api.post(

                    "/Company",

                    request

                );

                setCompanyExists(true);

                setCompanyId(response.data.company.companyId);

            }

            alert("Company saved successfully.");

        }
        catch (error) {

            console.error(error);

            alert("Unable to save company.");

        }

    };
    return (

        <div className="container mt-5">

            <div className="card shadow mb-4">

                <div className="card-body">

                    <h3 className="mb-4">
                        Company Profile
                    </h3>

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label">
                                Company Name
                            </label>

                            <input
                                className="form-control"
                                value={company.companyName}
                                onChange={(e) =>
                                    setCompany({
                                        ...company,
                                        companyName: e.target.value
                                    })
                                }
                            />

                        </div>

                        <div className="col-md-6 mb-3">

                            <label className="form-label">
                                Industry
                            </label>

                            <input
                                className="form-control"
                                value={company.industry}
                                onChange={(e) =>
                                    setCompany({
                                        ...company,
                                        industry: e.target.value
                                    })
                                }
                            />

                        </div>

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Website
                        </label>

                        <input
                            className="form-control"
                            value={company.website}
                            onChange={(e) =>
                                setCompany({
                                    ...company,
                                    website: e.target.value
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
                            value={company.location}
                            onChange={(e) =>
                                setCompany({
                                    ...company,
                                    location: e.target.value
                                })
                            }
                        />

                    </div>

                    <div className="mb-4">

                        <label className="form-label">
                            Description
                        </label>

                        <textarea
                            rows="4"
                            className="form-control"
                            value={company.description}
                            onChange={(e) =>
                                setCompany({
                                    ...company,
                                    description: e.target.value
                                })
                            }
                        />

                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSaveCompany}
                    >
                        {companyExists ? "Update Company" : "Save Company"}
                    </button>

                </div>

            </div>
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

                {companyExists ? (

                <Link
                    to="/create-job"
                    className="btn btn-primary"
                >
                    + Create Job
                </Link>

            ) : (

                <button
                    className="btn btn-secondary"
                    disabled
                >
                    Create your company first
                </button>

            )}
          
            </div>
            {!companyExists && (

                    <div className="alert alert-warning">

                    Complete your company profile before posting your first job.

                    </div>

                )}

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