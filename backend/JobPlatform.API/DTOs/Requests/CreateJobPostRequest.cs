namespace JobPlatform.API.DTOs;

public class CreateJobPostRequest
{
    public string Title { get; set; } = "";

    public string Description { get; set; } = "";

    public string Location { get; set; } = "";

    public decimal Salary { get; set; }

    public string EmploymentType { get; set; } = "";
}