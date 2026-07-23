namespace JobPlatform.API.DTOs;

public class JobPostResponse
{
    public int JobPostId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public string EmploymentType { get; set; } = string.Empty;
    public DateTime PostedAt { get; set; }
    public string? Tags { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
}