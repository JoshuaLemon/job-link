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

    // Stats for the hero section
    const totalJobs = jobs.length;
    const uniqueCompanies = new Set(jobs.map(j => j.companyName)).size;
    const totalProfessionals = totalJobs * 12 || 50000;

    return (
        <>
            {/* HERO SECTION - Dark Theme */}
            <section className="hero-section-dark py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <div className="mb-3">
                                <span className="badge bg-white-soft text-white px-3 py-2 rounded-pill">
                                    🌟 Over {(totalJobs || 12000).toLocaleString()}+ jobs from top-tier companies
                                </span>
                            </div>
                            <h1 className="display-2 fw-bold mb-3 text-white">
                                Find your next
                                <br />
                                <span className="text-primary-light">great role</span>
                            </h1>
                            <p className="lead text-white-50 mb-4">
                                Connect with forward-thinking companies that value what you bring. 
                                {totalProfessionals.toLocaleString()}+ professionals found their place here.
                            </p>

                            {/* Search Bar - Hero Style */}
                            <div className="hero-search bg-white p-2 rounded-4 shadow-sm mb-4">
                                <div className="d-flex flex-wrap gap-2">
                                    <div className="flex-grow-1">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg border-0"
                                            placeholder="Job title, company, or keyword"
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            style={{ boxShadow: 'none' }}
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <div className="position-relative">
                                            <select className="form-select form-select-lg border-0 bg-light rounded-3" style={{ minWidth: '140px' }}>
                                                <option>Remote</option>
                                                <option>On-site</option>
                                                <option>Hybrid</option>
                                            </select>
                                        </div>
                                        <button className="btn btn-primary btn-lg px-4 rounded-3" onClick={() => {}}>
                                            Search
                                        </button>
                                        {searchTerm && (
                                            <button className="btn btn-outline-secondary btn-lg" onClick={clearSearch}>
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Category Pills - Dark Theme */}
                            <div className="d-flex flex-wrap gap-2">
                                {['Engineering', 'Design', 'Product', 'Marketing', 'Data Science'].map((category) => (
                                    <button 
                                        key={category}
                                        className="btn btn-outline-white rounded-pill px-4 py-2"
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-5 d-none d-lg-block">
                            <div className="hero-stats-dark bg-white bg-opacity-10 p-4 rounded-4">
                                <div className="d-flex justify-content-between text-center">
                                    <div>
                                        <h2 className="fw-bold text-white mb-0">{(totalJobs || 12400).toLocaleString()}+</h2>
                                        <p className="text-white-50 small mb-0">Active listings</p>
                                    </div>
                                    <div>
                                        <h2 className="fw-bold text-white mb-0">{(uniqueCompanies || 3200).toLocaleString()}+</h2>
                                        <p className="text-white-50 small mb-0">Companies hiring</p>
                                    </div>
                                    <div>
                                        <h2 className="fw-bold text-white mb-0">{(totalProfessionals || 50000).toLocaleString()}+</h2>
                                        <p className="text-white-50 small mb-0">Professionals placed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RECOMMENDED JOBS SECTION */}
            {isEmployee && recommendedJobs.length > 0 && (
                <section className="py-4 bg-white">
                    <div className="container">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold mb-0">🎯 Recommended For You</h3>
                            <Link to="/employee" className="text-decoration-none">View all →</Link>
                        </div>
                        {loadingRecommended ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : recommendedJobs.length > 0 ? (
                            <div className="row">
                                {recommendedJobs.slice(0, 3).map((job) => (
                                    <div key={job.jobPostId} className="col-md-4 mb-3">
                                        <JobCard job={job} isRecommended={true} />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>
            )}

            {/* FEATURED OPPORTUNITIES SECTION */}
            <section className="py-5 bg-white">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold mb-0">Featured opportunities</h2>
                        <Link to="/" className="text-decoration-none">View all →</Link>
                    </div>

                    <FeedbackMessage section="jobs" />

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading available jobs...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-5">
                            <h4>No jobs found</h4>
                            <p className="text-muted">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {filteredJobs.slice(0, 8).map((job) => (
                                <div key={job.jobPostId} className="col-md-6 col-lg-3 mb-4">
                                    <JobCard job={job} compact={true} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* FOR JOB SEEKERS & EMPLOYERS SECTION */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h3 className="fw-bold mb-3">For Job Seekers</h3>
                                    <p className="text-muted mb-3">
                                        Build a standout profile, upload your resume, browse thousands of curated roles, 
                                        and track every application in one dashboard.
                                    </p>
                                    <Link to={user ? "/employee" : "/register"} className="btn btn-primary">
                                        {user ? "Go to Dashboard" : "Start your search"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h3 className="fw-bold mb-3">For Employers</h3>
                                    <p className="text-muted mb-3">
                                        Post jobs, manage applicants, track hiring pipelines, and build your employer brand — 
                                        all from a single, clean interface.
                                    </p>
                                    <Link to={user ? "/employer" : "/register"} className="btn btn-primary">
                                        {user ? "Go to Dashboard" : "Post a job today"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-4 border-top bg-white">
                <div className="container">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <span className="fw-bold">JobLink</span>
                            <span className="text-muted">© 2026</span>
                        </div>
                        <div className="d-flex gap-4">
                            <Link to="/privacy" className="text-decoration-none text-muted">Privacy</Link>
                            <Link to="/terms" className="text-decoration-none text-muted">Terms</Link>
                            <Link to="/contact" className="text-decoration-none text-muted">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Home;