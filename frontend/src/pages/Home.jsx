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
    const [activeCategory, setActiveCategory] = useState("");

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
            const searchLower = searchTerm.toLowerCase().trim();
            const terms = searchLower.split(/\s+/);
            
            // Helper function to check if two words are related (stem/root matching)
            const isWordMatch = (word, term) => {
                // Check if one contains the other (e.g., "engineer" in "engineering")
                if (word.includes(term) || term.includes(word)) return true;
                
                // Check common word endings
                const wordRoot = word.replace(/(ing|ed|er|s)$/, '');
                const termRoot = term.replace(/(ing|ed|er|s)$/, '');
                if (wordRoot === termRoot && wordRoot.length > 3) return true;
                
                return false;
            };
            
            const filtered = jobs.filter(job => {
                const jobText = [
                    job.title,
                    job.location,
                    job.employmentType,
                    job.companyName || "",
                    job.tags || ""
                ].join(" ").toLowerCase();
                
                const jobWords = jobText.split(/\s+/);
                
                // Check if ALL terms match ANY job word
                return terms.every(term => {
                    return jobWords.some(word => isWordMatch(word, term));
                });
            });
            
            // Sort by relevance
            filtered.sort((a, b) => {
                const aText = [
                    a.title, 
                    a.location, 
                    a.employmentType, 
                    a.companyName || "",
                    a.tags || ""
                ].join(" ").toLowerCase();
                
                const bText = [
                    b.title, 
                    b.location, 
                    b.employmentType, 
                    b.companyName || "",
                    b.tags || ""
                ].join(" ").toLowerCase();
                
                const aWords = aText.split(/\s+/);
                const bWords = bText.split(/\s+/);
                
                const aMatches = terms.filter(term => 
                    aWords.some(word => isWordMatch(word, term))
                ).length;
                
                const bMatches = terms.filter(term => 
                    bWords.some(word => isWordMatch(word, term))
                ).length;
                
                return bMatches - aMatches;
            });
            
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
        setActiveCategory("");
    };

    const clearSearch = () => {
        setSearchTerm("");
        setActiveCategory("");
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setSearchTerm(category);
    };

    const totalJobs = jobs.length;
    const uniqueCompanies = new Set(jobs.map(j => j.companyName)).size;
    const totalProfessionals = totalJobs * 12 || 50000;

    return (
        <>
            {/* HERO SECTION */}
            <section className="hero-section-dark">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-7 col-md-12">
                            <div className="mb-3">
                                <span className="badge-hero">
                                    🌟 Over {(totalJobs || 12000).toLocaleString()}+ jobs from top-tier companies
                                </span>
                            </div>
                            <h1 className="hero-title">
                                Find your next
                                <br />
                                <span className="text-gradient">great role</span>
                            </h1>
                            <p className="hero-subtitle">
                                Connect with forward-thinking companies that value what you bring. 
                                {totalProfessionals.toLocaleString()}+ professionals found their place here.
                            </p>

                            <div className="search-container">
                                <div className="search-wrapper">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Job title, company, or keyword"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                    <select className="search-select">
                                        <option>Remote</option>
                                        <option>On-site</option>
                                        <option>Hybrid</option>
                                    </select>
                                    <button className="search-btn" onClick={() => {}}>
                                        Search
                                    </button>
                                    {searchTerm && (
                                        <button className="search-clear" onClick={clearSearch}>
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="category-pills">
                                <button 
                                    className={`pill ${activeCategory === '' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveCategory('');
                                        setSearchTerm('');
                                    }}
                                >
                                    All
                                </button>
                                {['Engineering', 'Design', 'Product', 'Marketing', 'Data Science'].map((category) => (
                                    <button 
                                        key={category} 
                                        className={`pill ${activeCategory === category ? 'active' : ''}`}
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="stats-container">
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-number">{(totalJobs || 12400).toLocaleString()}+</div>
                                        <div className="stat-label">Active listings</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">{(uniqueCompanies || 3200).toLocaleString()}+</div>
                                        <div className="stat-label">Companies hiring</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">{(totalProfessionals || 50000).toLocaleString()}+</div>
                                        <div className="stat-label">Professionals placed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RECOMMENDED JOBS */}
            {isEmployee && recommendedJobs.length > 0 && (
                <section className="section-light">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">🎯 Recommended For You</h2>
                            <Link to="/employee" className="section-link">View all →</Link>
                        </div>
                        {loadingRecommended ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="job-grid">
                                {recommendedJobs.slice(0, 3).map((job) => (
                                    <div key={job.jobPostId}>
                                        <JobCard job={job} isRecommended={true} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* FEATURED OPPORTUNITIES */}
            <section className="section-light">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured opportunities</h2>
                        <Link to="/" className="section-link">View all →</Link>
                    </div>

                    <FeedbackMessage section="jobs" />

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted-light">Loading available jobs...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-light">No jobs found</h4>
                            <p className="text-muted-light">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="job-grid">
                            {filteredJobs.slice(0, 8).map((job) => (
                                <div key={job.jobPostId}>
                                    <JobCard job={job} compact={true} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="section-cta">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title-cta">Ready to find your next opportunity?</h2>
                        <p className="section-subtitle-cta">Join thousands of professionals and employers already using JobLink</p>
                    </div>
                    <div className="cta-grid">
                        <div className="cta-card cta-card-seekers">
                            <div className="cta-icon">🔍</div>
                            <h3>For Job Seekers</h3>
                            <p>
                                Build a standout profile, upload your resume, browse thousands of curated roles, 
                                and track every application in one dashboard.
                            </p>
                            <ul className="cta-features">
                                <li>✓ Create a professional profile</li>
                                <li>✓ Apply to jobs with one click</li>
                                <li>✓ Track your application status</li>
                                <li>✓ Get AI-powered recommendations</li>
                            </ul>
                            <Link to={user ? "/employee" : "/register"} className="cta-btn">
                                {user ? "Go to Dashboard →" : "Start your search →"}
                            </Link>
                        </div>
                        <div className="cta-card cta-card-employers">
                            <div className="cta-icon">🏢</div>
                            <h3>For Employers</h3>
                            <p>
                                Post jobs, manage applicants, track hiring pipelines, and build your employer brand — 
                                all from a single, clean interface.
                            </p>
                            <ul className="cta-features">
                                <li>✓ Post jobs in minutes</li>
                                <li>✓ Manage all applicants</li>
                                <li>✓ Track hiring pipelines</li>
                                <li>✓ Build your employer brand</li>
                            </ul>
                            <Link to={user ? "/employer" : "/register"} className="cta-btn">
                                {user ? "Go to Dashboard →" : "Post a job today →"}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer-dark">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="footer-logo">JobLink</span>
                            <span className="footer-copyright">© 2026</span>
                        </div>
                        <div className="footer-links">
                            <Link to="/privacy">Privacy</Link>
                            <Link to="/terms">Terms</Link>
                            <Link to="/contact">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Home;