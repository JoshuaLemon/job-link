import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Employee");

    const navigate = useNavigate();

    const handleRegister = async (e) => {

        e.preventDefault();

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {

            await api.post("/Auth/register", {
                firstName,
                lastName,
                email,
                password,
                role
            });

            alert("Registration successful!");

            navigate("/login");

        }
        catch (error) {

            console.error(error);

            if (error.response?.data) {
                alert(error.response.data);
            }
            else {
                alert("Registration failed.");
            }

        }

    };

    return (
        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-8 col-lg-6">

                    <div className="card shadow">

                        <div className="card-body p-4">

                            <h2 className="text-center fw-bold mb-2">
                                JobLink
                            </h2>

                            <p className="text-center text-muted mb-4">
                                Join JobLink and start your career journey.
                            </p>

                            <form onSubmit={handleRegister}>

                                <div className="row">

                                    <div className="col-md-6 mb-3">

                                        <label className="form-label">
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your first name"
                                            value={firstName}
                                            onChange={(e) =>
                                                setFirstName(e.target.value)
                                            }
                                        />

                                    </div>

                                    <div className="col-md-6 mb-3">

                                        <label className="form-label">
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your last name"
                                            value={lastName}
                                            onChange={(e) =>
                                                setLastName(e.target.value)
                                            }
                                        />

                                    </div>

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                    />

                                </div>

                                <div className="mb-4">

                                    <label className="form-label d-block">
                                        Register As
                                    </label>

                                    <div className="form-check form-check-inline">

                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            checked={role === "Employee"}
                                            onChange={() =>
                                                setRole("Employee")
                                            }
                                        />

                                        <label className="form-check-label">
                                            Job Seeker
                                        </label>

                                    </div>

                                    <div className="form-check form-check-inline">

                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            checked={role === "Employer"}
                                            onChange={() =>
                                                setRole("Employer")
                                            }
                                        />

                                        <label className="form-check-label">
                                            Employer
                                        </label>

                                    </div>

                                </div>

                                <button
                                    className="btn btn-primary btn-lg w-100"
                                    type="submit"
                                >
                                    Create Account
                                </button>

                            </form>

                            <p className="text-center mt-4 mb-0">
                                Already have an account?{" "}
                                <a href="/login">
                                    Login
                                </a>
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;