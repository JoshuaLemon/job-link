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
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <div className="auth-card-body">
                    <div className="auth-header">
                        <h2 className="auth-title">JobLink</h2>
                        <p className="auth-subtitle">Create your account and start your career journey</p>
                    </div>

                    <FeedbackMessage section="register" />

                    <form onSubmit={handleRegister}>
                        <div className="form-row">
                            <div className="form-group-half">
                                <label className="form-label">First Name <span className="form-required">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your first name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group-half">
                                <label className="form-label">Last Name <span className="form-required">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address <span className="form-required">*</span></label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password <span className="form-required">*</span></label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Create a password (min 6 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    className="password-toggle"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password <span className="form-required">*</span></label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    className="password-toggle"
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label d-block">Register As <span className="form-required">*</span></label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        checked={role === "Employee"}
                                        onChange={() => setRole("Employee")}
                                        disabled={loading}
                                    />
                                    👤 Job Seeker
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        checked={role === "Employer"}
                                        onChange={() => setRole("Employer")}
                                        disabled={loading}
                                    />
                                    🏢 Employer
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    disabled={loading}
                                />
                                I agree to the{" "}
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="auth-link">
                                    Privacy Policy
                                </a>{" "}
                                and{" "}
                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="auth-link">
                                    Terms of Service
                                </a>{" "}
                                <span className="form-required">*</span>
                            </label>
                        </div>

                        <button
                            className="btn-primary btn-full"
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

                    <div className="auth-footer">
                        <p className="auth-text">
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">
                                Login here
                            </Link>
                        </p>
                    </div>

                    <div className="auth-footer mt-1">
                        <Link to="/" className="auth-link">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;