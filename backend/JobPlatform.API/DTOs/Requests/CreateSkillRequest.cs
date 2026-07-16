namespace JobPlatform.API.DTOs;

public class CreateSkillRequest
{
    public int EmployeeProfileId { get; set; }

    public string SkillName { get; set; } = "";
}