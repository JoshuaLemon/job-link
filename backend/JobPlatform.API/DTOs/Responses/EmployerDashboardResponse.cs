namespace JobPlatform.API.DTOs;

public class EmployerDashboardResponse
{
    public int JobsPosted { get; set; }

    public int TotalApplicants { get; set; }

    public int Pending { get; set; }

    public int Interviews { get; set; }

    public int Hired { get; set; }
}