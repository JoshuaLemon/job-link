using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using JobPlatform.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using System.Security.Cryptography;

namespace JobPlatform.API.Controllers;

[EnableCors("ReactPolicy")]
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        ITokenService tokenService,
        IEmailService emailService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Test()
    {
        return Ok("Auth Controller Working!");
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists." });
            }

            var verificationToken = GenerateVerificationToken();

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                CreatedAt = DateTime.UtcNow,
                IsVerified = false,
                VerificationToken = verificationToken
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    user.FirstName,
                    verificationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send verification email to {user.Email}");
            }

            return Ok(new
            {
                message = "Registration successful! Please check your email to verify your account.",
                requiresVerification = true,
                user = new
                {
                    user.UserId,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.Role,
                    user.IsVerified
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Register");
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Invalid verification token." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.VerificationToken == token);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid verification token." });
            }

            if (user.IsVerified)
            {
                return Ok(new { message = "Email already verified. You can now login." });
            }

            user.IsVerified = true;
            user.VerifiedAt = DateTime.UtcNow;
            user.VerificationToken = null;

            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send welcome email to {user.Email}");
            }

            return Ok(new { message = "Email verified successfully! You can now login." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in VerifyEmail");
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid email or password." });
            }

            if (!user.IsVerified)
            {
                return BadRequest(new 
                { 
                    message = "Please verify your email before logging in.",
                    requiresVerification = true,
                    email = user.Email
                });
            }

            bool validPassword = BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

            if (!validPassword)
            {
                return BadRequest(new { message = "Invalid email or password." });
            }

            var token = _tokenService.CreateToken(user);

            return Ok(new
            {
                message = "Login successful!",
                token,
                user = new
                {
                    user.UserId,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.Role,
                    user.IsVerified,
                    user.CreatedAt
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Login");
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("verify-test-users")]
    public async Task<IActionResult> VerifyTestUsers()
    {
        try
        {
            var testEmails = new[] { "employee@test.com", "employer@test.com", "joshualemon249@gmail.com" };
            var users = await _context.Users
                .Where(u => testEmails.Contains(u.Email) && !u.IsVerified)
                .ToListAsync();

            foreach (var user in users)
            {
                user.IsVerified = true;
                user.VerifiedAt = DateTime.UtcNow;
                user.VerificationToken = null;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"✅ Verified {users.Count} test accounts.",
                verified = users.Select(u => u.Email)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in VerifyTestUsers");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null)
            {
                return Ok(new { message = "If your email is registered, you will receive a password reset link." });
            }

            var resetToken = GenerateVerificationToken();
            user.ResetPasswordToken = resetToken;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(24);
            
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendPasswordResetEmailAsync(
                    user.Email,
                    user.FirstName,
                    resetToken
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send password reset email to {user.Email}");
            }

            return Ok(new { message = "If your email is registered, you will receive a password reset link." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ForgotPassword");
            return StatusCode(500, new { message = "Server error" });
        }
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { message = "Token and new password are required." });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.ResetPasswordToken == request.Token);
            
            if (user == null)
            {
                return BadRequest(new { message = "Invalid or expired reset token." });
            }

            if (user.ResetPasswordTokenExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Reset token has expired. Please request a new one." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;
            
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendPasswordResetConfirmationAsync(user.Email, user.FirstName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send password reset confirmation to {user.Email}");
            }

            return Ok(new { message = "Password reset successfully! You can now login." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ResetPassword");
            return StatusCode(500, new { message = "Server error" });
        }
    }

    [AllowAnonymous]
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (user.IsVerified)
            {
                return BadRequest(new { message = "Email already verified." });
            }

            user.VerificationToken = GenerateVerificationToken();
            await _context.SaveChangesAsync();

            await _emailService.SendVerificationEmailAsync(
                user.Email,
                user.FirstName,
                user.VerificationToken);

            return Ok(new { message = "Verification email resent. Please check your inbox." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ResendVerification");
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Generates a random 64-character hex string for verification or reset tokens
    /// </summary>
    private string GenerateVerificationToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    }
}