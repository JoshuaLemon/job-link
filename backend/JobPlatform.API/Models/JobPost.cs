namespace JobPlatform.API.Models;

public class JobPost
{
    public int JobPostId { get; set; }

    // Foreign Key
    public int CompanyId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string EmploymentType { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public DateTime PostedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public Company? Company { get; set; }

    public ICollection<Application> Applications { get; set; } = new List<Application>();
}