import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function Navbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar-modern">
            <div className="navbar-container">
                <Link className="navbar-brand-modern" to="/">
                    <span className="brand-icon">💼</span>
                    JobLint {/* Changed to match image */}
                </Link>

                <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                    <span className="menu-icon">{isMenuOpen ? '✕' : '☰'}</span>
                </button>

                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link className="nav-link-modern" to="/" onClick={() => setIsMenuOpen(false)}>
                        Home
                    </Link>

                    {!user && (
                        <>
                            <Link className="nav-link-modern" to="/login" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                            <Link className="nav-link-modern" to="/register" onClick={() => setIsMenuOpen(false)}>
                                Register
                            </Link>
                        </>
                    )}

                    {user?.role === "Employee" && (
                        <Link className="nav-link-modern" to="/employee" onClick={() => setIsMenuOpen(false)}>
                            Dashboard
                        </Link>
                    )}

                    {user?.role === "Employer" && (
                        <Link className="nav-link-modern" to="/employer" onClick={() => setIsMenuOpen(false)}>
                            Dashboard
                        </Link>
                    )}

                    {user && (
                        <div className="nav-actions">
                            <button className="btn-logout" onClick={handleLogout}>
                                Logout
                            </button>
                            <button className="btn-delete" onClick={handleDeleteAccount} aria-label="Delete account">
                                🗑️
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;