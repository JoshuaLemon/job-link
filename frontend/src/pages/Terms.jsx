import { Link } from "react-router-dom";

function Terms() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Terms of Service</h2>
                <Link to="/" className="btn-back">
                    ← Back to Home
                </Link>
            </div>

            <div className="legal-card">
                <div className="legal-card-body">
                    <div className="legal-content">
                        <h4 className="legal-main-title">Welcome to JobLink</h4>
                        
                        <p className="legal-lead">
                            By using JobLink, you agree to the following terms and conditions.
                        </p>

                        <hr className="legal-divider" />

                        <div className="legal-section">
                            <h5 className="legal-section-title">1. User Responsibilities</h5>
                            <p className="legal-text">
                                By using JobLink, you agree to provide accurate information and
                                use the platform responsibly. You are solely responsible for the
                                content you post and the accuracy of the information you provide.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">2. Employer Responsibilities</h5>
                            <p className="legal-text">
                                Employers are responsible for the jobs they post. All job postings
                                must be genuine and comply with applicable laws and regulations.
                                Employers must not discriminate based on race, gender, religion,
                                or any other protected characteristic.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">3. Employee Responsibilities</h5>
                            <p className="legal-text">
                                Employees are responsible for the information contained in their
                                profiles and resumes. All information provided must be accurate
                                and truthful. Misrepresentation may result in account suspension.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">4. Platform Usage</h5>
                            <p className="legal-text">
                                This application is a prototype created for educational and
                                portfolio purposes. While we strive to maintain the platform,
                                we do not guarantee uninterrupted service or complete accuracy
                                of all information.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">5. Privacy</h5>
                            <p className="legal-text">
                                Your privacy is important to us. Please review our{" "}
                                <Link to="/privacy" className="legal-link">
                                    Privacy Policy
                                </Link>{" "}
                                to understand how we collect, use, and protect your personal
                                information.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">6. Account Termination</h5>
                            <p className="legal-text">
                                We reserve the right to suspend or terminate accounts that violate
                                these terms, engage in fraudulent activity, or misuse the platform
                                in any way.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">7. Changes to Terms</h5>
                            <p className="legal-text">
                                We may update these terms from time to time. Continued use of the
                                platform after changes constitutes acceptance of the new terms.
                            </p>
                        </div>

                        <div className="legal-section">
                            <h5 className="legal-section-title">8. Contact</h5>
                            <p className="legal-text">
                                If you have any questions about these terms, please contact us at
                                support@joblink.com.
                            </p>
                        </div>

                        <hr className="legal-divider" />

                        <div className="legal-footer">
                            <p className="legal-footer-text">
                                By using JobLink, you agree to these Terms of Service.
                            </p>
                            <div className="legal-footer-actions">
                                <Link to="/" className="btn-primary">
                                    Back to Home
                                </Link>
                                <Link to="/register" className="btn-success">
                                    Create Account
                                </Link>
                                <Link to="/privacy" className="btn-outline">
                                    Privacy Policy
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

export default Terms;