import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function EmployerDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

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
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [company, setCompany] = useState({
        companyName: "",
        industry: "",
        description: "",
        website: "",
        location: ""
    });

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
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load jobs
            const jobsResponse = await api.get("/JobPost/my-jobs");
            setJobs(jobsResponse.data);

            // Load stats
            const statsResponse = await api.get("/Application/dashboard");
            setStats(statsResponse.data);

            // Load company
            try {
                const companyResponse = await api.get(`/Company/${user.userId}`);
                setCompanyExists(true);
                setCompanyId(companyResponse.data.companyId);
                setCompany({
                    companyName: companyResponse.data.companyName,
                    industry: companyResponse.data.industry,
                    description: companyResponse.data.description,
                    website: companyResponse.data.website,
                    location: companyResponse.data.location
                });
            } catch {
                console.log("No company found.");
            }
        } catch (error) {
            console.error(error);
            showFeedback("general", "danger", "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditCompany = () => {
        setIsEditingCompany(true);
    };

    const handleCancelCompany = () => {
        setIsEditingCompany(false);
        // Refetch company data to reset
        api.get(`/Company/${user.userId}`)
            .then((response) => {
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
                await api.put(`/Company/${user.userId}`, request);
            } else {
                const response = await api.post("/Company", request);
                setCompanyExists(true);
                setCompanyId(response.data.company.companyId);
            }

            setIsEditingCompany(false);
            showFeedback("company", "success", "Company saved successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("company", "danger", "Unable to save company.");
        }
    };

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

    const handleCancelEdit = () => {
        setEditingJobId(null);
        setEditForm({
            title: "",
            description: "",
            location: "",
            salary: 0,
            employmentType: ""
        });
    };

    const handleSave = async () => {
        try {
            await api.put(`/JobPost/${editingJobId}`, editForm);
            setJobs(previousJobs =>
                previousJobs.map(job =>
                    job.jobPostId === editingJobId
                        ? { ...job, ...editForm }
                        : job
                )
            );
            setEditingJobId(null);
            showFeedback("job", "success", "Job updated successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("job", "danger", "Unable to update job.");
        }
    };

    const handleDelete = async (jobId) => {
        const confirmed = window.confirm("Are you sure you want to delete this job?");
        if (!confirmed) return;

        try {
            await api.delete(`/JobPost/${jobId}`);
            setJobs(previousJobs => previousJobs.filter(job => job.jobPostId !== jobId));
            showFeedback("job", "success", "Job deleted successfully.");
        } catch (error) {
            console.error(error);
            showFeedback("job", "danger", "Unable to delete job.");
        }
    };

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Employer Dashboard</h2>
                <div>
                    {companyExists ? (
                        <Link to="/create-job" className="btn btn-primary">
                            + Post a Job
                        </Link>
                    ) : (
                        <button className="btn btn-secondary" disabled>
                            Create your company first
                        </button>
                    )}
                </div>
            </div>

            {/* Company Warning */}
            {!companyExists && (
                <div className="alert alert-warning">
                    <strong>⚠️ Complete your company profile</strong>
                    <p className="mb-0 mt-1">Set up your company details before posting your first job. This helps attract the right candidates.</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6 className="text-muted">Jobs Posted</h6>
                            <h2 className="mb-0">{stats.jobsPosted}</h2>
                            <small className="text-muted">Total job postings</small>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6 className="text-muted">Total Applicants</h6>
                            <h2 className="mb-0">{stats.totalApplicants}</h2>
                            <small className="text-muted">Across all jobs</small>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6 className="text-muted">Pending</h6>
                            <h2 className="mb-0">{stats.pending}</h2>
                            <small className="text-muted">Awaiting review</small>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6 className="text-muted">Interviews</h6>
                            <h2 className="mb-0">{stats.interviews}</h2>
                            <small className="text-muted">Scheduled interviews</small>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card h-100 text-center shadow-sm">
                        <div className="card-body">
                            <h6 className="text-muted">Hired</h6>
                            <h2 className="mb-0">{stats.hired}</h2>
                            <small className="text-muted">Successful placements</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Profile Section */}
            <div className="card mb-5">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Company Profile</h5>
                        {!isEditingCompany && (
                            <button className="btn btn-primary" onClick={handleEditCompany}>
                                ✏️ {companyExists ? "Edit Company" : "Add Company"}
                            </button>
                        )}
                    </div>

                    <FeedbackMessage section="company" />

                    {isEditingCompany ? (
                        // Edit mode
                        <>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Company Name <span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g., Google Philippines"
                                        value={company.companyName}
                                        onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Industry <span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g., Technology, Healthcare, Finance"
                                        value={company.industry}
                                        onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Website</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g., https://www.yourcompany.com"
                                    value={company.website}
                                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Location <span className="text-danger">*</span></label>
                                <input
                                    className="form-control"
                                    placeholder="e.g., Makati, Philippines"
                                    value={company.location}
                                    onChange={(e) => setCompany({ ...company, location: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description <span className="text-danger">*</span></label>
                                <textarea
                                    rows="4"
                                    className="form-control"
                                    placeholder="Describe your company, mission, and culture..."
                                    value={company.description}
                                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <button className="btn btn-success me-2" onClick={handleSaveCompany}>
                                    Save Company
                                </button>
                                <button className="btn btn-secondary" onClick={handleCancelCompany}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        // View mode
                        <>
                            {company.companyName && (
                                <p><strong>Company Name:</strong> {company.companyName}</p>
                            )}
                            {company.industry && (
                                <p><strong>Industry:</strong> {company.industry}</p>
                            )}
                            {company.website && (
                                <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a></p>
                            )}
                            {company.location && (
                                <p><strong>Location:</strong> {company.location}</p>
                            )}
                            {company.description && (
                                <p><strong>Description:</strong> {company.description}</p>
                            )}
                            {!company.companyName && !company.industry && !company.description && (
                                <div className="text-center py-3">
                                    <p className="text-muted mb-2">No company information added yet.</p>
                                    <p className="text-muted small">Add your company details to attract the best talent.</p>
                                    <button className="btn btn-primary btn-sm mt-2" onClick={handleEditCompany}>
                                        ✏️ Add Company Information
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Jobs Section */}
            <FeedbackMessage section="job" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">My Jobs</h2>
                {/* Removed Add button from header */}
            </div>

            {jobs.length === 0 ? (
                <div className="card mb-3">
                    <div className="card-body text-center py-5">
                        {companyExists ? (
                            <>
                                <h4>No Jobs Posted Yet</h4>
                                <p className="text-muted mb-3">
                                    Start attracting talent by posting your first job opening.
                                </p>
                                <Link to="/create-job" className="btn btn-primary">
                                    + Post Your First Job
                                </Link>
                            </>
                        ) : (
                            <>
                                <h4>Complete Your Company Profile First</h4>
                                <p className="text-muted mb-3">
                                    You need to set up your company profile before posting jobs.
                                </p>
                                <button className="btn btn-primary" onClick={handleEditCompany}>
                                    ✏️ Set Up Company Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                jobs.map(job => (
                    <div key={job.jobPostId} className="card mb-3">
                        <div className="card-body">
                            {editingJobId === job.jobPostId ? (
                                // Edit mode
                                <>
                                    <h5 className="mb-3">Edit Job</h5>
                                    <div className="mb-3">
                                        <label className="form-label">Title <span className="text-danger">*</span></label>
                                        <input
                                            className="form-control"
                                            placeholder="e.g., Senior Software Engineer"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Describe the role, responsibilities, and requirements..."
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Location <span className="text-danger">*</span></label>
                                            <input
                                                className="form-control"
                                                placeholder="e.g., Makati, Philippines"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Salary <span className="text-danger">*</span></label>
                                            <input
                                                className="form-control"
                                                type="number"
                                                placeholder="e.g., 50000"
                                                value={editForm.salary}
                                                onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Employment Type <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={editForm.employmentType}
                                            onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div>
                                        <button className="btn btn-success me-2" onClick={handleSave}>
                                            Save Changes
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // View mode
                                <>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h4 className="mb-1">{job.title}</h4>
                                            <p className="text-muted mb-1">
                                                <strong>📍</strong> {job.location}
                                            </p>
                                            <p className="mb-0">
                                                <strong>💰 Salary:</strong> ₱{job.salary.toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`badge fs-6 px-3 py-2 bg-${job.employmentType === 'Full-time' ? 'primary' : job.employmentType === 'Part-time' ? 'info' : job.employmentType === 'Contract' ? 'warning' : 'secondary'}`}>
                                            {job.employmentType}
                                        </span>
                                    </div>
                                    <p className="mt-2">{job.description}</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            {/* No buttons here - they're on the right */}
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => handleEdit(job)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(job.jobPostId)}
                                            >
                                                🗑️ Delete
                                            </button>
                                            <Link
                                                to={`/applicants/${job.jobPostId}`}
                                                className="btn btn-info btn-sm"
                                            >
                                                👥 Applicants
                                            </Link>
                                        </div>
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