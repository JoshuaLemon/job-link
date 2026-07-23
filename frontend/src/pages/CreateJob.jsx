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
        employmentType: "",
        tags: ""
    });
    const [tagInput, setTagInput] = useState("");
    const [tagList, setTagList] = useState([]);

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

    const handleTagInputChange = (e) => {
        const value = e.target.value;
        
        // Check if space was pressed (last character is space)
        if (value.endsWith(' ')) {
            const newTag = value.trim();
            if (newTag && !tagList.includes(newTag)) {
                setTagList([...tagList, newTag]);
                setTagInput('');
            } else {
                setTagInput('');
            }
        } else {
            setTagInput(value);
        }
    };

    const handleTagKeyDown = (e) => {
        // Add tag on Enter key
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tagList.includes(newTag)) {
                setTagList([...tagList, newTag]);
                setTagInput('');
            }
        }
        // Remove last tag on Backspace when input is empty
        if (e.key === 'Backspace' && tagInput === '' && tagList.length > 0) {
            const newTagList = [...tagList];
            newTagList.pop();
            setTagList(newTagList);
        }
    };

    const removeTag = (tagToRemove) => {
        setTagList(tagList.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        // Add any remaining tag input as a tag
        if (tagInput.trim() && !tagList.includes(tagInput.trim())) {
            tagList.push(tagInput.trim());
        }

        // Join tags with commas for the API
        const tagsString = tagList.join(', ');
        const requestData = {
            ...form,
            salary: Number(form.salary),
            tags: tagsString
        };

        setSubmitting(true);
        try {
            await api.post("/JobPost", requestData);
            showFeedback("job", "success", "Job created successfully!");
            setTimeout(() => {
                navigate("/employer");
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Create New Job</h2>
                <Link to="/employer" className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="job" />

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
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

                        {/* Tags Input with Visual Chips */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Tags <span className="text-muted">(press space or enter to add)</span>
                            </label>
                            <div 
                                className="form-control d-flex flex-wrap align-items-center gap-1"
                                style={{ minHeight: '38px', padding: '4px 8px' }}
                                onClick={() => document.getElementById('tagInput').focus()}
                            >
                                {tagList.map((tag, index) => (
                                    <span 
                                        key={index} 
                                        className="badge bg-primary d-inline-flex align-items-center gap-1"
                                        style={{ fontSize: '0.9rem', padding: '6px 10px' }}
                                    >
                                        {tag}
                                        <span 
                                            className="badge bg-light text-dark rounded-circle"
                                            style={{ 
                                                cursor: 'pointer', 
                                                width: '18px', 
                                                height: '18px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                padding: 0
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeTag(tag);
                                            }}
                                        >
                                            ×
                                        </span>
                                    </span>
                                ))}
                                <input
                                    id="tagInput"
                                    type="text"
                                    className="border-0 flex-grow-1"
                                    style={{ 
                                        outline: 'none', 
                                        minWidth: '80px',
                                        background: 'transparent',
                                        padding: '4px 0'
                                    }}
                                    placeholder={tagList.length === 0 ? "Type a tag and press space..." : ""}
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagKeyDown}
                                    disabled={submitting}
                                />
                            </div>
                            <small className="text-muted">
                                Press <kbd>Space</kbd> or <kbd>Enter</kbd> to add a tag. Click × to remove.
                            </small>
                            {tagList.length > 0 && (
                                <small className="text-muted d-block mt-1">
                                    {tagList.length} tag{tagList.length !== 1 ? 's' : ''} added
                                </small>
                            )}
                        </div>

                        <div className="row">
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
                                to="/employer"
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