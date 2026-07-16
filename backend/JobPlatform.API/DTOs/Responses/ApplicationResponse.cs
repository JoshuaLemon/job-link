namespace JobPlatform.API.DTOs;

public class ApplicationResponse
{
    public int ApplicationId { get; set; }

    public int EmployeeProfileId { get; set; }

    public int JobPostId { get; set; }

    public DateTime AppliedAt { get; set; }

    public string Status { get; set; } = string.Empty;
}