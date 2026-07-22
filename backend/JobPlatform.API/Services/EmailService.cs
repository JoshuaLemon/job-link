using MailKit.Net.Smtp;
using MimeKit;

namespace JobPlatform.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendVerificationEmailAsync(string email, string firstName, string verificationToken)
    {
        try
        {
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";
            var verificationLink = $"{baseUrl}/verify-email?token={verificationToken}";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("JobLink", _configuration["Email:From"] ?? "noreply@joblink.com"));
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
            await client.ConnectAsync(
                _configuration["Email:Host"] ?? "smtp.gmail.com",
                int.Parse(_configuration["Email:Port"] ?? "587"),
                MailKit.Security.SecureSocketOptions.StartTls);
            
            await client.AuthenticateAsync(
                _configuration["Email:Username"],
                _configuration["Email:Password"]);
            
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            Console.WriteLine($"Verification email sent to {email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send verification email: {ex.Message}");
            throw;
        }
    }

    public async Task SendWelcomeEmailAsync(string email, string firstName)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("JobLink", _configuration["Email:From"] ?? "noreply@joblink.com"));
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
                                <a href='{_configuration["App:BaseUrl"] ?? "http://localhost:5000"}/login' class='button'>Login Now</a>
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
            await client.ConnectAsync(
                _configuration["Email:Host"] ?? "smtp.gmail.com",
                int.Parse(_configuration["Email:Port"] ?? "587"),
                MailKit.Security.SecureSocketOptions.StartTls);
            
            await client.AuthenticateAsync(
                _configuration["Email:Username"],
                _configuration["Email:Password"]);
            
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            Console.WriteLine($"Welcome email sent to {email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send welcome email: {ex.Message}");
        }
    }
}