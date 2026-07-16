import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        window.location.reload();
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link
                    className="navbar-brand"
                    to="/"
                >
                    Job Platform
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

                        <button
                            className="btn btn-danger ms-3"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    )}

                </div>

            </div>

        </nav>
    );
}

export default Navbar;