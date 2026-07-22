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
    private readonly IEmailService _emailService;  // Add this

    public AuthController(
        ApplicationDbContext context,
        ITokenService tokenService,
        IEmailService emailService)  // Add this parameter
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;  // Add this
    }

    [HttpGet]
    public IActionResult Test()
    {
        return Ok("Auth Controller Working!");
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)  // Make async
    {
        try
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists." });
            }

            // Generate verification token
            var verificationToken = GenerateVerificationToken();

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                CreatedAt = DateTime.UtcNow,
                IsVerified = false,  // Add this
                VerificationToken = verificationToken  // Add this
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send verification email
            try
            {
                await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    user.FirstName,
                    verificationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send verification email: {ex.Message}");
                // Don't throw - user can resend verification later
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

            // Send welcome email
            try
            {
                await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send welcome email: {ex.Message}");
            }

            return Ok(new { message = "Email verified successfully! You can now login." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)  // Make async
    {
        try
        {
            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid email or password." });
            }

            // Check if email is verified
            if (!user.IsVerified)
            {
                return BadRequest(new 
                { 
                    message = "Please verify your email before logging in.",
                    requiresVerification = true,
                    email = user.Email
                });
            }

            // Check password
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
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("verify-test-users")]
    public async Task<IActionResult> VerifyTestUsers()
    {
        try
        {
            var testEmails = new[] { "employee@test.com", "employer@test.com" };
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
            return StatusCode(500, new { error = ex.Message });
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

            // Generate new token
            user.VerificationToken = GenerateVerificationToken();
            await _context.SaveChangesAsync();

            // Resend email
            await _emailService.SendVerificationEmailAsync(
                user.Email,
                user.FirstName,
                user.VerificationToken);

            return Ok(new { message = "Verification email resent. Please check your inbox." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    private string GenerateVerificationToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    }
}