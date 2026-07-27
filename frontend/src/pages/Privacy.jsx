import { Link } from "react-router-dom";

function Privacy() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Privacy Policy</h2>
                <Link to="/" className="btn-back">
                    ← Back to Home
                </Link>
            </div>

            <div className="legal-card">
                <div className="legal-card-body">
                    <div className="legal-content">
                        <h4 className="legal-main-title">Your Privacy Matters</h4>
                        
                        <p className="legal-lead">
                            At JobLink, we are committed to protecting your privacy and personal information.
                        </p>

                        <hr className="legal-divider" />

                        <div className="legal-section">
                            <h5 className="legal-section-title">1. Information We Collect</h5>
                            <p className="legal-text">
                                JobLink collects the following information solely for demonstration purposes:
                            </p>
                            <ul className="legal-list">
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

                        <div className="legal-section">
                            <h5 className="legal-section-title">2. How We Use Your Information</h5>
                            <p className="legal-text">
                                The information you provide is used to:
                            </p>
                            <ul className="legal-list">
                                <li>Create and manage your account</li>
                                <li>Enable employers to view your profile and resume</li>
                                <li>Process job applications</li>
                                <li>Improve the platform experience</li>
                            </ul>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">3. Data Sharing</h5>
                            <p className="legal-text">
                                This prototype does not intentionally share your information
                                with third parties. However, as this is a demonstration project:
                            </p>
                            <ul className="legal-list">
                                <li>Your profile information may be visible to employers</li>
                                <li>Job applications are shared with the respective employers</li>
                                <li>No data is sold or transferred to external parties</li>
                            </ul>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">4. Data Storage</h5>
                            <p className="legal-text">
                                By creating an account, you consent to storing the information
                                you provide for use within this application. Your data is stored
                                securely on our servers and is only accessible to authorized users.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">5. Data Security</h5>
                            <p className="legal-text">
                                We take reasonable measures to protect your personal information
                                from unauthorized access, alteration, or disclosure. However, no
                                method of transmission over the internet is 100% secure, and we
                                cannot guarantee absolute security.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">6. Your Rights</h5>
                            <p className="legal-text">
                                You have the right to:
                            </p>
                            <ul className="legal-list">
                                <li>Access and review your personal information</li>
                                <li>Update or correct your information at any time</li>
                                <li>Delete your account and associated data</li>
                                <li>Withdraw consent for data processing</li>
                            </ul>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">7. Educational & Portfolio Use</h5>
                            <p className="legal-text">
                                This application is a prototype created for educational and
                                portfolio purposes. It is not intended for production use with
                                sensitive personal information.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">8. Contact Us</h5>
                            <p className="legal-text">
                                If you have any questions or concerns about this Privacy Policy,
                                please contact us at privacy@joblink.com.
                            </p>
                        </div>

                        <hr className="legal-divider" />

                        <div className="legal-footer">
                            <p className="legal-footer-text">
                                By using JobLink, you consent to the collection and use of your information as described in this Privacy Policy.
                            </p>
                            <div className="legal-footer-actions">
                                <Link to="/" className="btn-primary">
                                    Back to Home
                                </Link>
                                <Link to="/register" className="btn-success">
                                    Create Account
                                </Link>
                                <Link to="/terms" className="btn-outline">
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-4">
                <p className="legal-updated">
                    Last updated: July 2026
                </p>
            </div>
        </div>
    );
}

export default Privacy;