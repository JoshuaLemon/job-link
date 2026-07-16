import { useEffect, useState } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";

function Home() {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        api.get("/JobPost")
            .then((response) => {
                setJobs(response.data.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Job Platform</h1>

            {jobs.length === 0 ? (
                <p>No jobs found.</p>
            ) : (
                jobs.map((job) => (
                    <JobCard
                        key={job.jobPostId}
                        job={job}
                    />
                ))
            )}
        </div>
    );
}

export default Home;