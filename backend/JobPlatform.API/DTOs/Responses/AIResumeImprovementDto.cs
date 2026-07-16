namespace JobPlatform.API.DTOs;

public class AIResumeImprovementDto
{
    public string Headline { get; set; } = "";

    public string Bio { get; set; } = "";

    public List<ExperienceImprovementDto> Experiences { get; set; } = new();
}