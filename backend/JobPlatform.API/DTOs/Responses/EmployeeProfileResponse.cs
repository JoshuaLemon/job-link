namespace JobPlatform.API.DTOs;

public class EmployeeProfileResponse
{
    public int EmployeeProfileId { get; set; }
    public int UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new List<string>();
    public List<ExperienceDto> Experiences { get; set; } = new List<ExperienceDto>();
    public List<EducationDto> Educations { get; set; } = new List<EducationDto>();
    public double MatchScore { get; set; }
}

