import { Link } from "react-router-dom";

function Privacy() {
    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Privacy Policy</h2>
                <Link to="/" className="btn btn-secondary">
                    ← Back to Home
                </Link>
            </div>

            <div className="card">
                <div className="card-body p-4 p-md-5">
                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            <h4 className="mb-4">Your Privacy Matters</h4>
                            
                            <p className="lead">
                                At JobLink, we are committed to protecting your privacy and personal information.
                            </p>

                            <hr className="my-4" />

                            {/* Section 1 */}
                            <div className="mb-4">
                                <h5 className="text-primary">1. Information We Collect</h5>
                                <p>
                                    JobLink collects the following information solely for demonstration purposes:
                                </p>
                                <ul className="mb-0">
                                    <li>
                                        <strong>Account Information:</strong> Name, email address, and password
                                    </li>
                                    <li>
                                        <strong>Profile Details:</strong> Headline, bio, location, phone number, education, experience, and skills
                                    </li>
                                    <li>
                                        <strong>Resumes:</strong> Resume documents uploaded by users
                                    </li>
                                    <li>
                                        <strong>Job Applications:</strong> Applications submitted to job postings
                                    </li>
                                </ul>
                            </div>

                            {/* Section 2 */}
                            <div className="mb-4">
                                <h5 className="text-primary">2. How We Use Your Information</h5>
                                <p>
                                    The information you provide is used to:
                                </p>
                                <ul className="mb-0">
                                    <li>Create and manage your account</li>
                                    <li>Enable employers to view your profile and resume</li>
                                    <li>Process job applications</li>
                                    <li>Improve the platform experience</li>
                                </ul>
                            </div>

                            {/* Section 3 */}
                            <div className="mb-4">
                                <h5 className="text-primary">3. Data Sharing</h5>
                                <p>
                                    This prototype does not intentionally share your information
                                    with third parties. However, as this is a demonstration project:
                                </p>
                                <ul className="mb-0">
                                    <li>Your profile information may be visible to employers</li>
                                    <li>Job applications are shared with the respective employers</li>
                                    <li>No data is sold or transferred to external parties</li>
                                </ul>
                            </div>

                            {/* Section 4 */}
                            <div className="mb-4">
                                <h5 className="text-primary">4. Data Storage</h5>
                                <p>
                                    By creating an account, you consent to storing the information
                                    you provide for use within this application. Your data is stored
                                    securely on our servers and is only accessible to authorized users.
                                </p>
                            </div>

                            {/* Section 5 */}
                            <div className="mb-4">
                                <h5 className="text-primary">5. Data Security</h5>
                                <p>
                                    We take reasonable measures to protect your personal information
                                    from unauthorized access, alteration, or disclosure. However, no
                                    method of transmission over the internet is 100% secure, and we
                                    cannot guarantee absolute security.
                                </p>
                            </div>

                            {/* Section 6 */}
                            <div className="mb-4">
                                <h5 className="text-primary">6. Your Rights</h5>
                                <p>
                                    You have the right to:
                                </p>
                                <ul className="mb-0">
                                    <li>Access and review your personal information</li>
                                    <li>Update or correct your information at any time</li>
                                    <li>Delete your account and associated data</li>
                                    <li>Withdraw consent for data processing</li>
                                </ul>
                            </div>

                            {/* Section 7 */}
                            <div className="mb-4">
                                <h5 className="text-primary">7. Educational & Portfolio Use</h5>
                                <p>
                                    This application is a prototype created for educational and
                                    portfolio purposes. It is not intended for production use with
                                    sensitive personal information.
                                </p>
                            </div>

                            {/* Section 8 */}
                            <div className="mb-4">
                                <h5 className="text-primary">8. Contact Us</h5>
                                <p>
                                    If you have any questions or concerns about this Privacy Policy,
                                    please contact us at privacy@joblink.com.
                                </p>
                            </div>

                            <hr className="my-4" />

                            <div className="text-center">
                                <p className="text-muted mb-3">
                                    By using JobLink, you consent to the collection and use of your information as described in this Privacy Policy.
                                </p>
                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                    <Link to="/" className="btn btn-primary">
                                        Back to Home
                                    </Link>
                                    <Link to="/register" className="btn btn-success">
                                        Create Account
                                    </Link>
                                    <Link to="/terms" className="btn btn-outline-secondary">
                                        Terms of Service
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

export default Privacy;
