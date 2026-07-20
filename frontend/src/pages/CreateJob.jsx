import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function CreateJob() {

    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        employmentType: ""
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!form.title.trim()) {
            showFeedback("job", "danger", "Please enter a job title.");
            return;
        }
        if (!form.description.trim()) {
            showFeedback("job", "danger", "Please enter a job description.");
            return;
        }
        if (!form.location.trim()) {
            showFeedback("job", "danger", "Please enter a location.");
            return;
        }
        if (!form.salary || form.salary <= 0) {
            showFeedback("job", "danger", "Please enter a valid salary.");
            return;
        }
        if (!form.employmentType) {
            showFeedback("job", "danger", "Please select an employment type.");
            return;
        }

        setSubmitting(true);
        try {
            const requestData = {
                ...form,
                salary: Number(form.salary)
            };
            await api.post("/JobPost", requestData);
            showFeedback("job", "success", "Job created successfully!");
            setTimeout(() => {
                navigate("/employer-dashboard");
            }, 1500);
        } catch (error) {
            console.error(error);
            showFeedback("job", "danger", "Unable to create job. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Create New Job</h2>
                <Link to="/employer-dashboard" className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="job" />

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Job Title <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control"
                                placeholder="e.g., Senior Software Engineer"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        title: e.target.value
                                    })
                                }
                                disabled={submitting}
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Description <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className="form-control"
                                rows="5"
                                placeholder="Describe the job responsibilities, requirements, and benefits..."
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value
                                    })
                                }
                                disabled={submitting}
                            />
                        </div>

                        {/* Location */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Location <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control"
                                placeholder="e.g., Manila, Philippines or Remote"
                                value={form.location}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        location: e.target.value
                                    })
                                }
                                disabled={submitting}
                            />
                        </div>

                        <div className="row">
                            {/* Salary */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Salary <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="e.g., 50000"
                                    value={form.salary}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            salary: e.target.value
                                        })
                                    }
                                    disabled={submitting}
                                />
                            </div>

                            {/* Employment Type */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Employment Type <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    value={form.employmentType}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            employmentType: e.target.value
                                        })
                                    }
                                    disabled={submitting}
                                >
                                    <option value="">Select Employment Type</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="d-flex gap-2 mt-4">
                            <button
                                className="btn btn-success"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creating...
                                    </>
                                ) : (
                                    "Create Job"
                                )}
                            </button>
                            <Link
                                to="/employer-dashboard"
                                className="btn btn-secondary"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateJob;