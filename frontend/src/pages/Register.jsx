import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Employee");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

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

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation
        if (!firstName.trim()) {
            showFeedback("register", "danger", "Please enter your first name.");
            return;
        }
        if (!lastName.trim()) {
            showFeedback("register", "danger", "Please enter your last name.");
            return;
        }
        if (!email.trim()) {
            showFeedback("register", "danger", "Please enter your email address.");
            return;
        }
        if (!password) {
            showFeedback("register", "danger", "Please create a password.");
            return;
        }
        if (password.length < 6) {
            showFeedback("register", "danger", "Password must be at least 6 characters.");
            return;
        }
        if (!confirmPassword) {
            showFeedback("register", "danger", "Please confirm your password.");
            return;
        }
        if (password !== confirmPassword) {
            showFeedback("register", "danger", "Passwords do not match.");
            return;
        }
        if (!acceptedTerms) {
            showFeedback("register", "danger", "You must accept the Privacy Policy and Terms of Service.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/Auth/register", {
                firstName,
                lastName,
                email,
                password,
                role
            });

            showFeedback("register", "success", "Registration successful! Redirecting to login...");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || error.response?.data || "Registration failed. Please try again.";
            showFeedback("register", "danger", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-body p-4 p-md-5">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-1">JobLink</h2>
                                <p className="text-muted">Create your account and start your career journey</p>
                            </div>

                            <FeedbackMessage section="register" />

                            <form onSubmit={handleRegister}>
                                {/* Name Fields */}
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">
                                            First Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your first name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">
                                            Last Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your last name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Email Address <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                {/* Password */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Password <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Create a password (min 6 characters)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                        >
                                            {showPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Confirm Password <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={loading}
                                        >
                                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="mb-4">
                                    <label className="form-label d-block fw-semibold">
                                        Register As <span className="text-danger">*</span>
                                    </label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="employeeRole"
                                                checked={role === "Employee"}
                                                onChange={() => setRole("Employee")}
                                                disabled={loading}
                                            />
                                            <label className="form-check-label" htmlFor="employeeRole">
                                                👤 Job Seeker
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="employerRole"
                                                checked={role === "Employer"}
                                                onChange={() => setRole("Employer")}
                                                disabled={loading}
                                            />
                                            <label className="form-check-label" htmlFor="employerRole">
                                                🏢 Employer
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="form-check mb-4">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="termsCheck"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label className="form-check-label" htmlFor="termsCheck">
                                        I agree to the{" "}
                                        <a href="/privacy" target="_blank" rel="noopener noreferrer">
                                            Privacy Policy
                                        </a>{" "}
                                        and{" "}
                                        <a href="/terms" target="_blank" rel="noopener noreferrer">
                                            Terms of Service
                                        </a>{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    className="btn btn-primary btn-lg w-100"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>

                            {/* Login Link */}
                            <div className="text-center mt-4">
                                <p className="text-muted mb-0">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-decoration-none">
                                        Login here
                                    </Link>
                                </p>
                            </div>

                            {/* Back to Home */}
                            <div className="text-center mt-3">
                                <Link to="/" className="text-decoration-none small">
                                    ← Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;