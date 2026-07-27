import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            showFeedback("login", "danger", "Please enter your email address.");
            return;
        }
        if (!password.trim()) {
            showFeedback("login", "danger", "Please enter your password.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/Auth/login", {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            console.log("Login successful:", response.data);

            const role = response.data.user.role;
            showFeedback("login", "success", `Welcome back, ${response.data.user.firstName || 'User'}!`);

            setTimeout(() => {
                if (role === "Employee") {
                    navigate("/employee");
                } else if (role === "Employer") {
                    navigate("/employer");
                } else {
                    navigate("/");
                }
            }, 1000);

        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Invalid email or password. Please try again.";
            showFeedback("login", "danger", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card-body">
                    <div className="auth-header">
                        <h2 className="auth-title">Welcome Back</h2>
                        <p className="auth-subtitle">Login to your account to continue</p>
                    </div>

                    <FeedbackMessage section="login" />

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    className="form-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
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

                        <div className="auth-options">
                            <Link to="/forgot-password" className="auth-link-small">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            className="btn-primary btn-full"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="auth-text">
                            Don't have an account?{" "}
                            <Link to="/register" className="auth-link">
                                Register here
                            </Link>
                        </p>
                    </div>

                    <div className="demo-credentials">
                        <p className="demo-title">Demo Credentials:</p>
                        <p className="demo-text">Employee: employee@test.com / password123</p>
                        <p className="demo-text">Employer: employer@test.com / password123</p>
                    </div>

                    <div className="auth-footer mt-3">
                        <Link to="/" className="auth-link">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;