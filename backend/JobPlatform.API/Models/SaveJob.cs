namespace JobPlatform.API.Models;

public class SavedJob
{
    public int SavedJobId { get; set; }

    // Foreign Keys
    public int EmployeeProfileId { get; set; }

    public int JobPostId { get; set; }

    public DateTime SavedAt { get; set; }

    // Navigation Properties
    public EmployeeProfile? EmployeeProfile { get; set; }

    public JobPost? JobPost { get; set; }
}