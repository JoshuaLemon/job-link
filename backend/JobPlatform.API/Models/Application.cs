namespace JobPlatform.API.Models;

public class Application
{
    public int ApplicationId { get; set; }

    public int EmployeeProfileId { get; set; }

    public int JobPostId { get; set; }

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";

    public EmployeeProfile? EmployeeProfile { get; set; }

    public JobPost? JobPost { get; set; }


}