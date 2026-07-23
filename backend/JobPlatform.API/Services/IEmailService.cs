namespace JobPlatform.API.Services;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string email, string firstName, string verificationToken);
    Task SendWelcomeEmailAsync(string email, string firstName);

    Task SendPasswordResetEmailAsync(string email, string firstName, string resetToken);
    Task SendPasswordResetConfirmationAsync(string email, string firstName);
}
