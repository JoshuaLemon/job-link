using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Configuration;

namespace JobPlatform.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendVerificationEmailAsync(string email, string firstName, string verificationToken)
    {
        try
        {
            // Get SendGrid configuration
            var apiKey = _configuration["SendGrid:ApiKey"];
            var fromEmail = _configuration["SendGrid:FromEmail"] ?? "noreply@joblink.com";
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SendGrid API key is missing");
                throw new Exception("SendGrid is not properly configured.");
            }

            var verificationLink = $"{baseUrl}/verify-email?token={verificationToken}";

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail, "JobLink");
            var to = new EmailAddress(email, firstName);
            var subject = "Verify Your JobLink Account";

            var htmlContent = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4a6cf7; padding: 20px; text-align: center; color: white; }}
                        .content {{ padding: 20px; background-color: #f9f9f9; }}
                        .button {{ display: inline-block; padding: 12px 24px; background-color: #4a6cf7; color: white; 
                                 text-decoration: none; border-radius: 4px; }}
                        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #888; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Welcome to JobLink!</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {firstName},</h2>
                            <p>Thank you for registering with JobLink. Please verify your email address by clicking the button below:</p>
                            <p style='text-align: center;'>
                                <a href='{verificationLink}' class='button'>Verify Email</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p><a href='{verificationLink}'>{verificationLink}</a></p>
                            <p>This link will expire in <strong>24 hours</strong>.</p>
                            <p>If you didn't create an account, you can safely ignore this email.</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; {DateTime.UtcNow.Year} JobLink. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                _logger.LogInformation($"Verification email sent to {email}");
            }
            else
            {
                var responseBody = await response.Body.ReadAsStringAsync();
                _logger.LogWarning($"Email not sent. Status: {response.StatusCode}. Response: {responseBody}");
                throw new Exception($"SendGrid error: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send verification email to {email}");
            throw;
        }
    }

    public async Task SendWelcomeEmailAsync(string email, string firstName)
    {
        try
        {
            var apiKey = _configuration["SendGrid:ApiKey"];
            var fromEmail = _configuration["SendGrid:FromEmail"] ?? "noreply@joblink.com";
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SendGrid API key is missing");
                return;
            }

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail, "JobLink");
            var to = new EmailAddress(email, firstName);
            var subject = "Welcome to JobLink!";

            var htmlContent = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4a6cf7; padding: 20px; text-align: center; color: white; }}
                        .content {{ padding: 20px; background-color: #f9f9f9; }}
                        .button {{ display: inline-block; padding: 12px 24px; background-color: #4a6cf7; color: white; 
                                 text-decoration: none; border-radius: 4px; }}
                        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #888; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Welcome to JobLink!</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {firstName},</h2>
                            <p>Your account has been successfully verified!</p>
                            <p>You can now log in and start your job search journey.</p>
                            <p style='text-align: center;'>
                                <a href='{baseUrl}/login' class='button'>Login Now</a>
                            </p>
                            <p>Here's what you can do with JobLink:</p>
                            <ul>
                                <li>📝 Create your professional profile</li>
                                <li>🔍 Browse and apply for jobs</li>
                                <li>📊 Track your applications</li>
                                <li>📄 Generate AI-powered resumes</li>
                            </ul>
                        </div>
                        <div class='footer'>
                            <p>&copy; {DateTime.UtcNow.Year} JobLink. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
            await client.SendEmailAsync(msg);
            
            _logger.LogInformation($"Welcome email sent to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send welcome email to {email}");
        }
    }

    public async Task SendPasswordResetEmailAsync(string email, string firstName, string resetToken)
    {
        try
        {
            var apiKey = _configuration["SendGrid:ApiKey"];
            var fromEmail = _configuration["SendGrid:FromEmail"] ?? "noreply@joblink.com";
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SendGrid API key is missing");
                return;
            }

            var resetLink = $"{baseUrl}/reset-password?token={resetToken}";

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail, "JobLink");
            var to = new EmailAddress(email, firstName);
            var subject = "Reset Your JobLink Password";

            var htmlContent = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4a6cf7; padding: 20px; text-align: center; color: white; }}
                        .content {{ padding: 20px; background-color: #f9f9f9; }}
                        .button {{ display: inline-block; padding: 12px 24px; background-color: #4a6cf7; color: white; 
                                text-decoration: none; border-radius: 4px; }}
                        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #888; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Reset Your Password</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {firstName},</h2>
                            <p>We received a request to reset your JobLink password. Click the button below to set a new password:</p>
                            <p style='text-align: center;'>
                                <a href='{resetLink}' class='button'>Reset Password</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p><a href='{resetLink}'>{resetLink}</a></p>
                            <p>This link will expire in <strong>24 hours</strong>.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; {DateTime.UtcNow.Year} JobLink. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
            await client.SendEmailAsync(msg);
            
            _logger.LogInformation($"Password reset email sent to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send password reset email to {email}");
        }
    }

    public async Task SendPasswordResetConfirmationAsync(string email, string firstName)
    {
        try
        {
            var apiKey = _configuration["SendGrid:ApiKey"];
            var fromEmail = _configuration["SendGrid:FromEmail"] ?? "noreply@joblink.com";
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SendGrid API key is missing");
                return;
            }

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail, "JobLink");
            var to = new EmailAddress(email, firstName);
            var subject = "Your Password Has Been Reset";

            var htmlContent = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #28a745; padding: 20px; text-align: center; color: white; }}
                        .content {{ padding: 20px; background-color: #f9f9f9; }}
                        .button {{ display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; 
                                text-decoration: none; border-radius: 4px; }}
                        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #888; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Password Reset Successful</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {firstName},</h2>
                            <p>Your JobLink password has been successfully reset.</p>
                            <p>If you didn't do this, please contact us immediately.</p>
                            <p style='text-align: center;'>
                                <a href='{baseUrl}/login' class='button'>Login Now</a>
                            </p>
                        </div>
                        <div class='footer'>
                            <p>&copy; {DateTime.UtcNow.Year} JobLink. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
            await client.SendEmailAsync(msg);
            
            _logger.LogInformation($"Password reset confirmation sent to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send password reset confirmation to {email}");
        }
    }
}