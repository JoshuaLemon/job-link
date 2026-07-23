import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
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
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function App() {
    return (
        <>
            <NavBar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Protected Employee Routes */}
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute role="Employee">
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />

                {/*Protected Forget/Request Password Routes */}
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Employer Routes */}
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