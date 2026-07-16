namespace JobPlatform.API.Models;

public class Experience
{
    public int ExperienceId { get; set; }

    public int EmployeeProfileId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public EmployeeProfile? EmployeeProfile { get; set; }
}