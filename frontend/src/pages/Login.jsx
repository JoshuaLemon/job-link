import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/Auth/login", {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            console.log("Token saved.");
            console.log(response.data);

            const role = response.data.user.role;

            if (role === "Employee") {
                navigate("/employee");
            }
            else if (role === "Employer") {
                navigate("/employer");
            }

        } catch (error) {
            console.error(error);

            alert("Invalid email or password.");
        }
    };

    return (
        <div className="container mt-5">

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <div className="mb-3">
                    <label>Email</label>

                    <input
                        className="form-control"
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />
                </div>

                <div className="mb-3">
                    <label>Password</label>

                    <input
                        className="form-control"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />
                </div>

                <button
                    className="btn btn-primary"
                    type="submit"
                >
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;