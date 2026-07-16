namespace JobPlatform.API.DTOs;

public class ResumeResponse
{
    public string FirstName { get; set; } = "";

    public string LastName { get; set; } = "";

    public string Email { get; set; } = "";

    public string PhoneNumber { get; set; } = "";

    public string Location { get; set; } = "";

    public string Headline { get; set; } = "";

    public string Bio { get; set; } = "";

    public bool IsAIGenerated { get; set; }

    public List<EducationDto> Educations { get; set; } = new();

    public List<ExperienceDto> Experiences { get; set; } = new();

    public List<string> Skills { get; set; } = new();
}