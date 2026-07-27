import { Link } from "react-router-dom";

function TalentCard({ talent }) {
    return (
        <div className="talent-card">
            <div className="talent-card-header">
                <span className="talent-match-badge">⭐ Match Score: {talent.matchScore}%</span>
                <span className="talent-top-badge">Top Candidate</span>
            </div>
            <div className="talent-card-body">
                <div className="talent-card-top">
                    <div>
                        <h4 className="talent-name">{talent.firstName} {talent.lastName}</h4>
                        {talent.headline && (
                            <p className="talent-headline">
                                🎯 {talent.headline}
                            </p>
                        )}
                        {talent.location && (
                            <p className="talent-location">
                                📍 {talent.location}
                            </p>
                        )}
                    </div>
                    <span className="talent-match-percentage">
                        {talent.matchScore}% Match
                    </span>
                </div>

                {talent.skills && talent.skills.length > 0 && (
                    <div className="talent-skills">
                        <span className="talent-skills-label">Skills:</span>
                        {talent.skills.map((skill, index) => (
                            <span key={index} className="talent-skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                <div className="talent-stats">
                    {talent.experiences && talent.experiences.length > 0 && (
                        <span className="talent-stat">
                            💼 {talent.experiences.length} experience{talent.experiences.length !== 1 ? 's' : ''}
                        </span>
                    )}
                    {talent.educations && talent.educations.length > 0 && (
                        <span className="talent-stat">
                            🎓 {talent.educations.length} education{talent.educations.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <Link 
                    to={`/employee-profile/${talent.employeeProfileId}`} 
                    className="talent-view-btn"
                    target="_blank"
                >
                    View Full Profile →
                </Link>
            </div>
        </div>
    );
}

export default TalentCard;