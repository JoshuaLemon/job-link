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

        // Validate form
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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4 p-md-5">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="mb-1">Welcome Back</h2>
                                <p className="text-muted">Login to your account to continue</p>
                            </div>

                            <FeedbackMessage section="login" />

                            <form onSubmit={handleLogin}>
                                {/* Email */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Email Address
                                    </label>
                                    <input
                                        className="form-control form-control-lg"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>

                                {/* Password */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Password
                                    </label>
                                    <div className="input-group">
                                        <input
                                            className="form-control form-control-lg"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
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

                                {/* Submit Button */}
                                <button
                                    className="btn btn-primary btn-lg w-100"
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

                            {/* Register Link */}
                            <div className="text-center mt-4">
                                <p className="text-muted mb-0">
                                    Don't have an account?{" "}
                                    <Link to="/register" className="text-decoration-none">
                                        Register here
                                    </Link>
                                </p>
                            </div>

                            {/* Demo Credentials */}
                            <div className="mt-4 p-3 bg-light rounded">
                                <p className="text-muted small mb-1">
                                    <strong>Demo Credentials:</strong>
                                </p>
                                <p className="text-muted small mb-0">
                                    Employee: employee@test.com / password123
                                </p>
                                <p className="text-muted small mb-0">
                                    Employer: employer@test.com / password123
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

export default Login;