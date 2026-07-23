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
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <div className="card-body text-center py-5">
                                <h3 className="text-success">📧 Check Your Email</h3>
                                <p className="mt-3">
                                    If <strong>{email}</strong> is registered, you'll receive a password reset link.
                                </p>
                                <p className="text-muted">The link will expire in 24 hours.</p>
                                <Link to="/login" className="btn btn-primary mt-3">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h2 className="mb-1">Forgot Password</h2>
                                <p className="text-muted">
                                    Enter your email and we'll send you a reset link.
                                </p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="alert alert-success" role="alert">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    className="btn btn-primary btn-lg w-100"
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

                            <div className="text-center mt-4">
                                <Link to="/login" className="text-decoration-none">
                                    ← Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;