import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await api.post("/Auth/forgot-password", { email });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-card-body text-center py-5">
                        <div className="auth-icon">📧</div>
                        <h3 className="auth-success-title">Check Your Email</h3>
                        <p className="auth-text">
                            If <strong>{email}</strong> is registered, you'll receive a password reset link.
                        </p>
                        <p className="auth-hint">The link will expire in 24 hours.</p>
                        <Link to="/login" className="btn-primary mt-3">
                            Back to Login
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
                        <h2 className="auth-title">Forgot Password</h2>
                        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
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
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoFocus
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
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
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

export default ForgotPassword;