using JobPlatform.API.DTOs;
using JobPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumeController : ControllerBase
{
    private readonly IAIResumePdfService _pdfService;

    public ResumeController(IAIResumePdfService pdfService)
    {
        _pdfService = pdfService;
    }

    [Authorize]
    [HttpPost("download-ai")]
    public async Task<IActionResult> DownloadAIResume(
        [FromBody] ResumeResponse resume)
    {
        var pdf = await _pdfService.GeneratePdfAsync(resume);

        return File(
            pdf,
            "application/pdf",
            "AI_Resume.pdf");
    }
}