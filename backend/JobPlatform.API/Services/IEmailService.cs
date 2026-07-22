namespace JobPlatform.API.Services;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string email, string firstName, string verificationToken);
    Task SendWelcomeEmailAsync(string email, string firstName);
}