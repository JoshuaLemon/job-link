namespace JobPlatform.API.Models;

public class Education
{
    public int EducationId { get; set; }

    // Foreign Key
    public int EmployeeProfileId { get; set; }

    public string SchoolName { get; set; } = string.Empty;

    public string Degree { get; set; } = string.Empty;

    public string FieldOfStudy { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    // Navigation Property
    public EmployeeProfile? EmployeeProfile { get; set; }
}