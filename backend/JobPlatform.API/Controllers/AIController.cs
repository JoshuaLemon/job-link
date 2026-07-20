using System.Security.Claims;
using JobPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace JobPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("ReactPolicy")] 
public class AIController : ControllerBase
{
    private readonly IAIResumeService _aiResumeService;
    private readonly ILogger<AIController> _logger; 

    public AIController(
        IAIResumeService aiResumeService,
        ILogger<AIController> logger) 
    {
        _aiResumeService = aiResumeService;
        _logger = logger;
    }

    [Authorize]
    [HttpPost("generate-resume")]
    [EnableCors("ReactPolicy")] 
    public async Task<IActionResult> GenerateResume()
    {
        try
        {
            _logger.LogInformation("Starting AI resume generation");
            
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                _logger.LogWarning("User ID claim not found");
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userId = int.Parse(userIdClaim.Value);
            _logger.LogInformation($"Generating resume for user {userId}");

            var resume = await _aiResumeService.GenerateResumeAsync(userId);
            
            _logger.LogInformation($"Resume generated successfully for user {userId}");
            return Ok(resume);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI resume");
            return StatusCode(500, new { message = "Failed to generate resume", error = ex.Message });
        }
    }

    // Add a test endpoint that doesn't require authorization
    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult Test()
    {
        return Ok(new { message = "AI Controller is working" });
    }
}