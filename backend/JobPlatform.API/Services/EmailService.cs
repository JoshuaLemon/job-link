using MailKit.Net.Smtp;
using MimeKit;
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
            // Get configuration with proper fallbacks
            var fromEmail = _configuration["Email:From"] ?? "noreply@joblink.com";
            var host = _configuration["Email:Host"] ?? "smtp.gmail.com";
            var port = int.Parse(_configuration["Email:Port"] ?? "587");
            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";

            // Validate required config
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                _logger.LogError("Email configuration missing: Username or Password");
                throw new Exception("Email service is not properly configured.");
            }

            var verificationLink = $"{baseUrl}/verify-email?token={verificationToken}";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("JobLink", fromEmail));
            message.To.Add(new MailboxAddress(firstName, email));
            message.Subject = "Verify Your JobLink Account";

            var body = $@"
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

            message.Body = new TextPart("html") { Text = body };

            using var client = new SmtpClient();
            
            // Connect with timeout
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
            
            // Authenticate
            await client.AuthenticateAsync(username, password);
            
            // Send email
            await client.SendAsync(message);
            
            // Disconnect
            await client.DisconnectAsync(true);
            
            _logger.LogInformation($"Verification email sent to {email}");
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
            var fromEmail = _configuration["Email:From"] ?? "noreply@joblink.com";
            var host = _configuration["Email:Host"] ?? "smtp.gmail.com";
            var port = int.Parse(_configuration["Email:Port"] ?? "587");
            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                _logger.LogError("Email configuration missing: Username or Password");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("JobLink", fromEmail));
            message.To.Add(new MailboxAddress(firstName, email));
            message.Subject = "Welcome to JobLink!";

            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4a6cf7; padding: 20px; text-align: center; color: white; }}
                        .content {{ padding: 20px; background-color: #f9f9f9; }}
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

            message.Body = new TextPart("html") { Text = body };

            using var client = new SmtpClient();
            
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            _logger.LogInformation($"Welcome email sent to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send welcome email to {email}");
        }
    }
}