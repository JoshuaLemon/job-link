namespace JobPlatform.API.Models;

public class Skill
{
    public int SkillId { get; set; }

    public int EmployeeProfileId { get; set; }

    public string SkillName { get; set; } = string.Empty;

    public EmployeeProfile? EmployeeProfile { get; set; }
}