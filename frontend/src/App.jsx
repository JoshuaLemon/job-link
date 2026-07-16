import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerViewProfile from "./pages/EmployerViewProfile";
import CreateJob from "./pages/CreateJob";
import JobDetails from "./pages/JobDetails";
import Applicants from "./pages/Applicants";

function App() {
    return (
        <>
            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute role="Employee">
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employer"
                    element={
                        <ProtectedRoute role="Employer">
                            <EmployerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-job"
                    element={
                        <ProtectedRoute role="Employer">
                            <CreateJob />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/applicants/:id"
                    element={
                        <ProtectedRoute role="Employer">
                            <Applicants />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/jobs/:id"
                    element={<JobDetails />}
                />

                 <Route
                    path="/employee-profile/:id"
                    element={
                        <ProtectedRoute role="Employer">
                            <EmployerViewProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee-profile/:id"
                    element={
                        <ProtectedRoute role="Employer">
                            <EmployerViewProfile />
                        </ProtectedRoute>
                    }
                />
              

            </Routes>
        </>
    );
}

export default App;