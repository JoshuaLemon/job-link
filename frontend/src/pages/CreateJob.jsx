import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function CreateJob() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        salary: 0,
        employmentType: ""
    });

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await api.post(
                "/JobPost",
                form
            );

            alert("Job created successfully.");

            navigate("/employer");

        }
        catch (error) {

            console.error(error);

            alert("Unable to create job.");

        }

    };

    return (

        <div className="container mt-5">

            <h2>Create Job</h2>

            <form onSubmit={handleSubmit}>

                <div className="mb-3">

                    <label>Title</label>

                    <input
                        className="form-control"
                        value={form.title}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                title: e.target.value
                            })
                        }
                    />

                </div>

                <div className="mb-3">

                    <label>Description</label>

                    <textarea
                        className="form-control"
                        rows="4"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value
                            })
                        }
                    />

                </div>

                <div className="mb-3">

                    <label>Location</label>

                    <input
                        className="form-control"
                        value={form.location}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                location: e.target.value
                            })
                        }
                    />

                </div>

                <div className="mb-3">

                    <label>Salary</label>

                    <input
                        className="form-control"
                        type="number"
                        value={form.salary}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                salary: Number(e.target.value)
                            })
                        }
                    />

                </div>

                <div className="mb-3">

                    <label>Employment Type</label>

                    <input
                        className="form-control"
                        value={form.employmentType}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                employmentType: e.target.value
                            })
                        }
                    />

                </div>

                <button
                    className="btn btn-primary"
                    type="submit"
                >
                    Create Job
                </button>

            </form>

        </div>

    );
}

export default CreateJob;