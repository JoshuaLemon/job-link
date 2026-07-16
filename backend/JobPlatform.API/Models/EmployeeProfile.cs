namespace JobPlatform.API.Models;

public class EmployeeProfile
{
    public int EmployeeProfileId { get; set; }

    // Foreign Key
    public int UserId { get; set; }

    public string Headline { get; set; } = string.Empty;

    public string Bio { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    // Navigation Property
    public User? User { get; set; }

    public ICollection<Education> Educations { get; set; } = new List<Education>();

    public ICollection<Experience> Experiences { get; set; } = new List<Experience>();

    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
    
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}