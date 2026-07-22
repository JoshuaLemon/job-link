namespace JobPlatform.API.Models;

public class User
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Add these new properties for email verification
    public bool IsVerified { get; set; } = false;

    public string? VerificationToken { get; set; }

    public DateTime? VerifiedAt { get; set; }
}