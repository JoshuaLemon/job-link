using System.Security.Claims;
using JobPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IAIResumeService _aiResumeService;

    public AIController(IAIResumeService aiResumeService)
    {
        _aiResumeService = aiResumeService;
    }

    [Authorize]
    [HttpPost("generate-resume")]
    public async Task<IActionResult> GenerateResume()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var resume = await _aiResumeService.GenerateResumeAsync(userId);

        return Ok(resume);
    }
}