namespace JobPlatform.API.DTOs;

public class JobPostResponse
{
    public int JobPostId { get; set; }

    public int CompanyId { get; set; }

    public string Title { get; set; } = "";

    public string Description { get; set; } = "";

    public string Location { get; set; } = "";

    public decimal Salary { get; set; }

    public string EmploymentType { get; set; } = "";

    public DateTime PostedAt { get; set; }
}