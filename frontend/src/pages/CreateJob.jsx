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
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tagList.includes(newTag)) {
                setTagList([...tagList, newTag]);
                setTagInput('');
            }
        }
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

        if (tagInput.trim() && !tagList.includes(tagInput.trim())) {
            tagList.push(tagInput.trim());
        }

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
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Create New Job</h2>
                <Link to="/employer" className="btn-back">
                    ← Back to Dashboard
                </Link>
            </div>

            <FeedbackMessage section="job" />

            <div className="create-job-card">
                <div className="create-job-card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                Job Title <span className="form-required">*</span>
                            </label>
                            <input
                                className="form-input"
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

                        <div className="form-group">
                            <label className="form-label">
                                Description <span className="form-required">*</span>
                            </label>
                            <textarea
                                className="form-textarea"
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

                        <div className="form-group">
                            <label className="form-label">
                                Location <span className="form-required">*</span>
                            </label>
                            <input
                                className="form-input"
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

                        <div className="form-group">
                            <label className="form-label">
                                Tags <span className="form-hint">(press space or enter to add)</span>
                            </label>
                            <div 
                                className="tag-container"
                                onClick={() => document.getElementById('tagInput').focus()}
                            >
                                {tagList.map((tag, index) => (
                                    <span key={index} className="tag-chip">
                                        {tag}
                                        <span className="tag-remove" onClick={(e) => {
                                            e.stopPropagation();
                                            removeTag(tag);
                                        }}>
                                            ×
                                        </span>
                                    </span>
                                ))}
                                <input
                                    id="tagInput"
                                    type="text"
                                    className="tag-input"
                                    placeholder={tagList.length === 0 ? "Type a tag and press space..." : ""}
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagKeyDown}
                                    disabled={submitting}
                                />
                            </div>
                            <small className="form-hint-text">
                                Press <kbd>Space</kbd> or <kbd>Enter</kbd> to add a tag. Click × to remove.
                            </small>
                            {tagList.length > 0 && (
                                <small className="form-hint-text d-block mt-1">
                                    {tagList.length} tag{tagList.length !== 1 ? 's' : ''} added
                                </small>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group-half">
                                <label className="form-label">
                                    Salary <span className="form-required">*</span>
                                </label>
                                <input
                                    className="form-input"
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

                            <div className="form-group-half">
                                <label className="form-label">
                                    Employment Type <span className="form-required">*</span>
                                </label>
                                <select
                                    className="form-select-custom"
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

                        <div className="form-actions">
                            <button
                                className="btn-submit"
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
                                className="btn-cancel"
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