namespace JobPlatform.API.DTOs;

public class EducationDto
{
    public string SchoolName { get; set; } = "";

    public string Degree { get; set; } = "";

    public string FieldOfStudy { get; set; } = "";

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
}