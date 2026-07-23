import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import JobCard from "../components/JobCard";

function Home() {
    const [jobs, setJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRecommended, setLoadingRecommended] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredJobs, setFilteredJobs] = useState([]);

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

    const user = JSON.parse(localStorage.getItem("user"));
    const isEmployer = user?.role === "Employer";
    const isEmployee = user?.role === "Employee";

    useEffect(() => {
        loadJobs();
        if (isEmployee) {
            loadRecommendedJobs();
        }
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredJobs(jobs);
        } else {
            const filtered = jobs.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.employmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (job.tags && job.tags.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredJobs(filtered);
        }
    }, [searchTerm, jobs]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get("/JobPost");
            setJobs(response.data.data || []);
            setFilteredJobs(response.data.data || []);
        } catch (error) {
            console.error(error);
            showFeedback("jobs", "danger", "Failed to load jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadRecommendedJobs = async () => {
        setLoadingRecommended(true);
        try {
            const response = await api.get("/JobPost/recommended?limit=5");
            setRecommendedJobs(response.data.data || []);
        } catch (error) {
            console.error(error);
            // Silently fail - recommendations are optional
        } finally {
            setLoadingRecommended(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0">Job Link</h1>
                    <p className="text-muted">Find your dream job today</p>
                </div>
                <div>
                    {isEmployer && (
                        <Link to="/create-job" className="btn btn-primary">
                            + Post a Job
                        </Link>
                    )}
                    {!user && (
                        <div>
                            <Link to="/login" className="btn btn-outline-primary me-2">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </div>
                    )}
                    {isEmployee && (
                        <Link to="/employee" className="btn btn-outline-primary">
                            My Dashboard
                        </Link>
                    )}
                </div>
            </div>

            <FeedbackMessage section="jobs" />

            {/* Recommended Jobs Section - Only for Employees */}
            {isEmployee && (
                <div className="mb-4">
                    <h3 className="mb-3">🎯 Recommended For You</h3>
                    {loadingRecommended ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2 text-muted">Finding jobs for you...</span>
                        </div>
                    ) : recommendedJobs.length > 0 ? (
                        <div>
                            {recommendedJobs.map((job) => (
                                <div key={job.jobPostId} className="mb-3">
                                    <JobCard job={job} isRecommended={true} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card bg-light">
                            <div className="card-body text-center py-3">
                                <p className="text-muted mb-0">
                                    Complete your profile to get personalized job recommendations!
                                </p>
                                <Link to="/employee" className="btn btn-sm btn-primary mt-2">
                                    Update Profile
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search Bar */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-md-9">
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Search jobs by title, location, type, or tags..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex gap-2">
                                <button className="btn btn-primary btn-lg w-100" onClick={() => {}}>
                                    <i className="bi bi-search"></i> Search
                                </button>
                                {searchTerm && (
                                    <button className="btn btn-outline-secondary btn-lg" onClick={clearSearch}>
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {searchTerm && (
                        <div className="mt-2">
                            <small className="text-muted">
                                Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                            </small>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            {!loading && jobs.length > 0 && (
                <div className="d-flex gap-4 mb-4 flex-wrap">
                    <div>
                        <span className="badge bg-primary fs-6 px-3 py-2">
                            Total Jobs: {jobs.length}
                        </span>
                    </div>
                    <div>
                        <span className="badge bg-success fs-6 px-3 py-2">
                            Types: {new Set(jobs.map(j => j.employmentType)).size}
                        </span>
                    </div>
                    <div>
                        <span className="badge bg-info text-dark fs-6 px-3 py-2">
                            Locations: {new Set(jobs.map(j => j.location)).size}
                        </span>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading jobs...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading available jobs...</p>
                </div>
            )}

            {/* Jobs List */}
            {!loading && filteredJobs.length === 0 && searchTerm && (
                <div className="card mb-3">
                    <div className="card-body text-center py-5">
                        <h4>No Results Found</h4>
                        <p className="text-muted mb-3">
                            No jobs match your search criteria.
                        </p>
                        <button className="btn btn-primary" onClick={clearSearch}>
                            Clear Search
                        </button>
                    </div>
                </div>
            )}

            {!loading && filteredJobs.length === 0 && !searchTerm && (
                <div className="card mb-3">
                    <div className="card-body text-center py-5">
                        <h4>No Jobs Available</h4>
                        <p className="text-muted mb-3">
                            There are currently no job postings available.
                        </p>
                        {isEmployer && (
                            <Link to="/create-job" className="btn btn-primary">
                                Post Your First Job
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {!loading && filteredJobs.length > 0 && (
                <div className="row">
                    {filteredJobs.map((job) => (
                        <div key={job.jobPostId} className="col-12 mb-3">
                            <JobCard job={job} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;