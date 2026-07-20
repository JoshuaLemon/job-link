import { Link } from "react-router-dom";

function Terms() {
    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Terms of Service</h2>
                <Link to="/" className="btn btn-secondary">
                    ← Back to Home
                </Link>
            </div>

            <div className="card">
                <div className="card-body p-4 p-md-5">
                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            <h4 className="mb-4">Welcome to JobLink</h4>
                            
                            <p className="lead">
                                By using JobLink, you agree to the following terms and conditions.
                            </p>

                            <hr className="my-4" />

                            {/* Section 1 */}
                            <div className="mb-4">
                                <h5 className="text-primary">1. User Responsibilities</h5>
                                <p>
                                    By using JobLink, you agree to provide accurate information and
                                    use the platform responsibly. You are solely responsible for the
                                    content you post and the accuracy of the information you provide.
                                </p>
                            </div>

                            {/* Section 2 */}
                            <div className="mb-4">
                                <h5 className="text-primary">2. Employer Responsibilities</h5>
                                <p>
                                    Employers are responsible for the jobs they post. All job postings
                                    must be genuine and comply with applicable laws and regulations.
                                    Employers must not discriminate based on race, gender, religion,
                                    or any other protected characteristic.
                                </p>
                            </div>

                            {/* Section 3 */}
                            <div className="mb-4">
                                <h5 className="text-primary">3. Employee Responsibilities</h5>
                                <p>
                                    Employees are responsible for the information contained in their
                                    profiles and resumes. All information provided must be accurate
                                    and truthful. Misrepresentation may result in account suspension.
                                </p>
                            </div>

                            {/* Section 4 */}
                            <div className="mb-4">
                                <h5 className="text-primary">4. Platform Usage</h5>
                                <p>
                                    This application is a prototype created for educational and
                                    portfolio purposes. While we strive to maintain the platform,
                                    we do not guarantee uninterrupted service or complete accuracy
                                    of all information.
                                </p>
                            </div>

                            {/* Section 5 */}
                            <div className="mb-4">
                                <h5 className="text-primary">5. Privacy</h5>
                                <p>
                                    Your privacy is important to us. Please review our{" "}
                                    <Link to="/privacy" className="text-decoration-none">
                                        Privacy Policy
                                    </Link>{" "}
                                    to understand how we collect, use, and protect your personal
                                    information.
                                </p>
                            </div>

                            {/* Section 6 */}
                            <div className="mb-4">
                                <h5 className="text-primary">6. Account Termination</h5>
                                <p>
                                    We reserve the right to suspend or terminate accounts that violate
                                    these terms, engage in fraudulent activity, or misuse the platform
                                    in any way.
                                </p>
                            </div>

                            {/* Section 7 */}
                            <div className="mb-4">
                                <h5 className="text-primary">7. Changes to Terms</h5>
                                <p>
                                    We may update these terms from time to time. Continued use of the
                                    platform after changes constitutes acceptance of the new terms.
                                </p>
                            </div>

                            {/* Section 8 */}
                            <div className="mb-4">
                                <h5 className="text-primary">8. Contact</h5>
                                <p>
                                    If you have any questions about these terms, please contact us at
                                    support@joblink.com.
                                </p>
                            </div>

                            <hr className="my-4" />

                            <div className="text-center">
                                <p className="text-muted mb-3">
                                    By using JobLink, you agree to these Terms of Service.
                                </p>
                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                    <Link to="/" className="btn btn-primary">
                                        Back to Home
                                    </Link>
                                    <Link to="/register" className="btn btn-success">
                                        Create Account
                                    </Link>
                                    <Link to="/privacy" className="btn btn-outline-secondary">
                                        Privacy Policy
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
                <p className="text-muted small">
                    Last updated: July 2026
                </p>
            </div>
        </div>
    );
}

export default Terms;