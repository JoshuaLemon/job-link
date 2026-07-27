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
        employmentType: "",
        tags: ""
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
            <div className={`alert alert-${feedback.type}`} role="alert">
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
            const jobsResponse = await api.get("/JobPost/my-jobs");
            setJobs(jobsResponse.data);

            const statsResponse = await api.get("/Application/dashboard");
            setStats(statsResponse.data);

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
            employmentType: job.employmentType,
            tags: job.tags || ""
        });
    };

    const handleCancelEdit = () => {
        setEditingJobId(null);
        setEditForm({
            title: "",
            description: "",
            location: "",
            salary: 0,
            employmentType: "",
            tags: ""
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

    const getTags = (tags) => {
        if (!tags) return [];
        return tags.split(',').map(t => t.trim()).filter(t => t);
    };

    return (
        <div className="profile-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h2 className="page-title">Employer Dashboard</h2>
                    <p className="text-muted-light" style={{ marginTop: '4px' }}>Manage your company and job postings</p>
                </div>
                <div>
                    {companyExists ? (
                        <Link to="/create-job" className="btn-primary">
                            ➕ Post a Job
                        </Link>
                    ) : (
                        <button className="btn-secondary" disabled>
                            Create your company first
                        </button>
                    )}
                </div>
            </div>

            {!companyExists && (
                <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                    <strong>⚠️ Complete your company profile</strong>
                    <p style={{ marginTop: '4px', marginBottom: '0' }}>Set up your company details before posting your first job.</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid-dashboard">
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <h6 className="stat-label">Jobs Posted</h6>
                    <h2 className="stat-number">{stats.jobsPosted}</h2>
                    <small className="stat-sub">Total job postings</small>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <h6 className="stat-label">Total Applicants</h6>
                    <h2 className="stat-number">{stats.totalApplicants}</h2>
                    <small className="stat-sub">Across all jobs</small>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <h6 className="stat-label">Pending</h6>
                    <h2 className="stat-number">{stats.pending}</h2>
                    <small className="stat-sub">Awaiting review</small>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <h6 className="stat-label">Interviews</h6>
                    <h2 className="stat-number">{stats.interviews}</h2>
                    <small className="stat-sub">Scheduled interviews</small>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <h6 className="stat-label">Hired</h6>
                    <h2 className="stat-number">{stats.hired}</h2>
                    <small className="stat-sub">Successful placements</small>
                </div>
            </div>

            {/* Company Profile */}
            <div className="profile-card">
                <div className="profile-card-body">
                    <div className="profile-header">
                        <div>
                            <h5 className="profile-title">🏢 Company Profile</h5>
                            {companyExists && company.companyName && (
                                <p className="text-muted-light" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                                    {company.companyName}
                                </p>
                            )}
                        </div>
                        {!isEditingCompany && (
                            <button className="btn-edit-profile" onClick={handleEditCompany}>
                                ✏️ {companyExists ? "Edit Company" : "Add Company"}
                            </button>
                        )}
                    </div>

                    <FeedbackMessage section="company" />

                    {isEditingCompany ? (
                        <>
                            <div className="form-row">
                                <div className="form-group-half">
                                    <label className="form-label">Company Name <span className="form-required">*</span></label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g., Google Philippines"
                                        value={company.companyName}
                                        onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-half">
                                    <label className="form-label">Industry <span className="form-required">*</span></label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g., Technology, Healthcare, Finance"
                                        value={company.industry}
                                        onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group-half">
                                    <label className="form-label">Website</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g., https://www.yourcompany.com"
                                        value={company.website}
                                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-half">
                                    <label className="form-label">Location <span className="form-required">*</span></label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g., Makati, Philippines"
                                        value={company.location}
                                        onChange={(e) => setCompany({ ...company, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description <span className="form-required">*</span></label>
                                <textarea
                                    className="form-textarea"
                                    rows="4"
                                    placeholder="Describe your company, mission, and culture..."
                                    value={company.description}
                                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button className="btn-save" onClick={handleSaveCompany}>
                                    Save Company
                                </button>
                                <button className="btn-cancel" onClick={handleCancelCompany}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="company-details-grid">
                            {company.companyName && (
                                <div className="company-detail-item">
                                    <span className="company-detail-label">Company Name</span>
                                    <span className="company-detail-value">{company.companyName}</span>
                                </div>
                            )}
                            {company.industry && (
                                <div className="company-detail-item">
                                    <span className="company-detail-label">Industry</span>
                                    <span className="company-detail-value">{company.industry}</span>
                                </div>
                            )}
                            {company.website && (
                                <div className="company-detail-item">
                                    <span className="company-detail-label">Website</span>
                                    <span className="company-detail-value">
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#7a9cff' }}>
                                            {company.website}
                                        </a>
                                    </span>
                                </div>
                            )}
                            {company.location && (
                                <div className="company-detail-item">
                                    <span className="company-detail-label">Location</span>
                                    <span className="company-detail-value">{company.location}</span>
                                </div>
                            )}
                            {company.description && (
                                <div className="company-detail-item" style={{ gridColumn: '1 / -1' }}>
                                    <span className="company-detail-label">Description</span>
                                    <span className="company-detail-value" style={{ lineHeight: '1.6' }}>{company.description}</span>
                                </div>
                            )}
                            {!company.companyName && !company.industry && !company.description && (
                                <div className="empty-state-small" style={{ gridColumn: '1 / -1' }}>
                                    <p className="text-muted-light">No company information added yet.</p>
                                    <button className="btn-primary-sm" onClick={handleEditCompany}>
                                        ✏️ Add Company Information
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* My Jobs Section */}
            <div className="section-header">
                <div>
                    <h2 className="section-title">💼 My Jobs</h2>
                    <p className="text-muted-light" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} posted
                    </p>
                </div>
                {companyExists && jobs.length > 0 && (
                    <Link to="/create-job" className="btn-primary-sm">
                        + Post New Job
                    </Link>
                )}
            </div>

            <FeedbackMessage section="job" />

            {jobs.length === 0 ? (
                <div className="empty-state-large">
                    {companyExists ? (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📌</div>
                            <h4>No Jobs Posted Yet</h4>
                            <p className="text-muted-light">Start attracting talent by posting your first job opening.</p>
                            <Link to="/create-job" className="btn-primary">
                                + Post Your First Job
                            </Link>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
                            <h4>Complete Your Company Profile First</h4>
                            <p className="text-muted-light">You need to set up your company profile before posting jobs.</p>
                            <button className="btn-primary" onClick={handleEditCompany}>
                                ✏️ Set Up Company Profile
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {jobs.map(job => (
                        <div key={job.jobPostId} className="job-card-modern">
                            {editingJobId === job.jobPostId ? (
                                <div className="job-card-body">
                                    <h5 className="item-card-title">✏️ Edit Job</h5>
                                    <div className="form-group">
                                        <label className="form-label">Title <span className="form-required">*</span></label>
                                        <input
                                            className="form-input"
                                            placeholder="e.g., Senior Software Engineer"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description <span className="form-required">*</span></label>
                                        <textarea
                                            className="form-textarea"
                                            rows="3"
                                            placeholder="Describe the role, responsibilities, and requirements..."
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group-half">
                                            <label className="form-label">Location <span className="form-required">*</span></label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g., Makati, Philippines"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group-half">
                                            <label className="form-label">Salary <span className="form-required">*</span></label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                placeholder="e.g., 50000"
                                                value={editForm.salary}
                                                onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group-half">
                                            <label className="form-label">Employment Type <span className="form-required">*</span></label>
                                            <select
                                                className="form-select-custom"
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
                                        <div className="form-group-half">
                                            <label className="form-label">Tags <span className="form-hint">(comma-separated)</span></label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g., Remote, Full-stack, Senior"
                                                value={editForm.tags}
                                                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button className="btn-save" onClick={handleSave}>
                                            💾 Save Changes
                                        </button>
                                        <button className="btn-cancel" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="job-card-body">
                                    <div className="job-card-header-modern">
                                        <div>
                                            <h3 className="job-card-title-modern">{job.title}</h3>
                                            <div className="job-card-meta">
                                                <span className="job-meta-item">📍 {job.location}</span>
                                                <span className="job-meta-item">💰 ₱{job.salary.toLocaleString()}</span>
                                                <span className={`employment-badge ${job.employmentType === 'Full-time' ? 'badge-fulltime' : job.employmentType === 'Part-time' ? 'badge-parttime' : job.employmentType === 'Contract' ? 'badge-contract' : 'badge-other'}`}>
                                                    {job.employmentType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="job-card-actions">
                                            <button className="btn-edit" onClick={() => handleEdit(job)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(job.jobPostId)}>
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>

                                    {job.tags && (
                                        <div className="job-tags">
                                            {getTags(job.tags).map((tag, index) => (
                                                <span key={index} className="job-tag">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <p className="job-description">{job.description}</p>

                                    <div className="job-card-footer-modern">
                                        <Link
                                            to={`/job/${job.jobPostId}`}
                                            className="btn-view-talent"
                                        >
                                            👁️ View Job & Talents
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {companyExists && (
                        <div className="text-center" style={{ marginTop: '1.5rem' }}>
                            <Link 
                                to="/create-job" 
                                className="btn-add-dashed"
                            >
                                ➕ Post a New Job
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default EmployerDashboard;