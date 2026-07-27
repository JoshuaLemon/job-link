import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        window.location.reload();
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "This will permanently delete your account.\n\nThis action cannot be undone."
        );
        if (!confirmed) return;

        try {
            await api.delete("/User/me");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            alert("Your account has been deleted.");
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            alert("Unable to delete account.");
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link
                    className="navbar-brand"
                    to="/"
                >
                    Job Link
                </Link>

                <div className="navbar-nav">

                    <Link
                        className="nav-link"
                        to="/"
                    >
                        Home
                    </Link>

                    {!user && (
                        <>
                            <Link
                                className="nav-link"
                                to="/login"
                            >
                                Login
                            </Link>

                            <Link
                                className="nav-link"
                                to="/register"
                            >
                                Register
                            </Link>
                        </>
                    )}

                    {user?.role === "Employee" && (
                        <Link
                            className="nav-link"
                            to="/employee"
                        >
                            Employee Dashboard
                        </Link>
                    )}

                    {user?.role === "Employer" && (
                        <Link
                            className="nav-link"
                            to="/employer"
                        >
                            Employer Dashboard
                        </Link>
                    )}

                    {user && (
                        <>
                            <button
                                className="btn btn-danger ms-3"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                            <button
                                className="btn btn-outline-danger ms-2"
                                onClick={handleDeleteAccount}
                                style={{ borderColor: '#dc3545', color: '#dc3545' }}
                            >
                                🗑️ Delete Account
                            </button>
                        </>
                    )}

                </div>

            </div>

        </nav>
    );
}

export default Navbar;