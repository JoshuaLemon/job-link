namespace JobPlatform.API.DTOs;

public class CreateJobPostRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public string EmploymentType { get; set; } = string.Empty;
    public string? Tags { get; set; } = string.Empty; 
}