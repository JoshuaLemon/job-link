namespace JobPlatform.API.DTOs;

public class CreateCompanyRequest
{
    public int UserId { get; set; }

    public string CompanyName { get; set; } = "";

    public string Industry { get; set; } = "";

    public string Description { get; set; } = "";

    public string Website { get; set; } = "";

    public string Location { get; set; } = "";
}