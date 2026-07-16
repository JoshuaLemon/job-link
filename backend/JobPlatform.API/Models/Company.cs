namespace JobPlatform.API.Models;

public class Company
{
    public int CompanyId { get; set; }

    // Foreign Key
    public int UserId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string Industry { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    // Navigation Property
    public User? User { get; set; }

    public ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
}
