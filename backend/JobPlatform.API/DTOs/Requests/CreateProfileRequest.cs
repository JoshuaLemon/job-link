namespace JobPlatform.API.DTOs;

public class CreateProfileRequest
{
    public int UserId { get; set; }

    public string Headline { get; set; } = "";

    public string Bio { get; set; } = "";

    public string Location { get; set; } = "";

    public string PhoneNumber { get; set; } = "";
}