import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirect to the correct dashboard based on user's role
        if (user.role === "Employee") {
            return <Navigate to="/employee" replace />;
        } else if (user.role === "Employer") {
            return <Navigate to="/employer" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;