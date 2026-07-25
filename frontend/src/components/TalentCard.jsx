import { Link } from "react-router-dom";

function TalentCard({ talent }) {
    return (
        <div className="card mb-3 border-primary">
            <div className="card-header bg-primary text-white py-1 d-flex justify-content-between align-items-center">
                <small>⭐ Match Score: {talent.matchScore}%</small>
                <small className="text-white-50">Top Candidate</small>
            </div>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h4>{talent.firstName} {talent.lastName}</h4>
                        {talent.headline && (
                            <p className="text-muted mb-1">
                                <strong>🎯</strong> {talent.headline}
                            </p>
                        )}
                        {talent.location && (
                            <p className="text-muted mb-1">
                                <strong>📍</strong> {talent.location}
                            </p>
                        )}
                    </div>
                    <span className="badge bg-success fs-6 px-3 py-2">
                        {talent.matchScore}% Match
                    </span>
                </div>

                {talent.skills && talent.skills.length > 0 && (
                    <div className="mt-2">
                        <strong>Skills:</strong>
                        {talent.skills.map((skill, index) => (
                            <span key={index} className="badge bg-secondary me-1 px-2 py-1">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {talent.experiences && talent.experiences.length > 0 && (
                    <div className="mt-2">
                        <small className="text-muted">
                            💼 {talent.experiences.length} experience
                            {talent.experiences.length !== 1 ? 's' : ''}
                        </small>
                    </div>
                )}

                {talent.educations && talent.educations.length > 0 && (
                    <div className="mt-1">
                        <small className="text-muted">
                            🎓 {talent.educations.length} education
                            {talent.educations.length !== 1 ? 's' : ''}
                        </small>
                    </div>
                )}

                <div className="mt-3">
                    <Link 
                        to={`/employee-profile/${talent.employeeProfileId}`} 
                        className="btn btn-primary btn-sm"
                        target="_blank"
                    >
                        View Full Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default TalentCard;