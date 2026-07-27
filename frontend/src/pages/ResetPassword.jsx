import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No reset token provided.");
        } else {
            setStatus("ready");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await api.post("/Auth/reset-password", {
                token,
                newPassword: password
            });
            
            setStatus("success");
            setMessage("Password reset successfully!");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="auth-text mt-3">Verifying reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-card-body text-center py-5">
                        <div className="auth-icon">✅</div>
                        <h3 className="auth-success-title">Password Reset!</h3>
                        <p className="auth-text">{message}</p>
                        <p className="auth-hint">Redirecting to login...</p>
                        <Link to="/login" className="btn-primary mt-3">
                            Login Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-card-body text-center py-5">
                        <div className="auth-icon" style={{ fontSize: '3rem' }}>❌</div>
                        <h3 className="auth-error-title">Invalid Link</h3>
                        <p className="auth-text">{message || "The reset link is invalid or expired."}</p>
                        <Link to="/forgot-password" className="btn-primary mt-3">
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card-body">
                    <div className="auth-header">
                        <h2 className="auth-title">Reset Password</h2>
                        <p className="auth-subtitle">Enter your new password below.</p>
                    </div>

                    {error && (
                        <div className="alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="alert-success" role="alert">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoFocus
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
                            <label className="form-label">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button
                            className="btn-primary btn-full"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/login" className="auth-link">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;