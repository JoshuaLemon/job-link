namespace JobPlatform.API.DTOs;

public class CreateExperienceRequest
{
    public int EmployeeProfileId { get; set; }

    public string CompanyName { get; set; } = "";

    public string JobTitle { get; set; } = "";

    public string Description { get; set; } = "";

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
}