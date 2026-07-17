using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;

using JobPlatform.API.Services;

namespace JobPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    public AuthController(
    ApplicationDbContext context,
    ITokenService tokenService)
{
    _context = context;
    _tokenService = tokenService;
}

    [HttpGet]
    public IActionResult Test()
    {
        return Ok("Auth Controller Working!");
    }
    [AllowAnonymous]
    [HttpPost("register")]
    public IActionResult Register(RegisterRequest request)
    {
        // Check if email already exists
        if (_context.Users.Any(u => u.Email == request.Email))
        {
            return BadRequest("Email already exists.");
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };

        _context.Users.Add(user);

        _context.SaveChanges();

        return Ok(user);
    }
[AllowAnonymous]

    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        // Find user by email
        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

        if (user == null)
        {
            return BadRequest("Invalid email or password.");
        }

        // Check password
        bool validPassword = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash);

        if (!validPassword)
        {
            return BadRequest("Invalid email or password.");
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
                user.Role
            }
        });
    }
}