import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token provided.");
            return;
        }

        api.get(`/Auth/verify-email?token=${token}`)
            .then((response) => {
                setStatus("success");
                setMessage(response.data.message || response.data);
            })
            .catch((error) => {
                setStatus("error");
                setMessage(error.response?.data?.message || "Verification failed.");
            });
    }, [token]);

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card-body text-center py-5">
                    {status === "loading" && (
                        <>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Verifying...</span>
                            </div>
                            <p className="auth-text mt-3">Verifying your email...</p>
                        </>
                    )}
                    {status === "success" && (
                        <>
                            <div className="auth-icon">✅</div>
                            <h3 className="auth-success-title">Email Verified!</h3>
                            <p className="auth-text">{message}</p>
                            <Link to="/login" className="btn-primary mt-3">
                                Login Now
                            </Link>
                        </>
                    )}
                    {status === "error" && (
                        <>
                            <div className="auth-icon" style={{ fontSize: '3rem' }}>❌</div>
                            <h3 className="auth-error-title">Verification Failed</h3>
                            <p className="auth-text">{message}</p>
                            <Link to="/" className="btn-outline mt-3">
                                Go Home
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;