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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body text-center py-5">
                            {status === "loading" && (
                                <>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Verifying...</span>
                                    </div>
                                    <p className="mt-3">Verifying your email...</p>
                                </>
                            )}
                            {status === "success" && (
                                <>
                                    <h3 className="text-success">✅ Email Verified!</h3>
                                    <p className="mt-3">{message}</p>
                                    <Link to="/login" className="btn btn-primary mt-3">
                                        Login Now
                                    </Link>
                                </>
                            )}
                            {status === "error" && (
                                <>
                                    <h3 className="text-danger">❌ Verification Failed</h3>
                                    <p className="mt-3">{message}</p>
                                    <Link to="/" className="btn btn-secondary mt-3">
                                        Go Home
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail; 