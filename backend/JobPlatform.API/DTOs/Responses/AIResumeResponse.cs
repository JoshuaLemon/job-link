namespace JobPlatform.API.DTOs;

public class AIResumeResponse
{
    public string Headline { get; set; } = "";

    public string Bio { get; set; } = "";

    public List<AIExperienceDto> Experiences { get; set; } = new();
}

public class AIExperienceDto
{
    public string Description { get; set; } = "";
}