using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using JobPlatform.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using System.Security.Claims;
namespace JobPlatform.API.Controllers;

[Authorize(Roles = "Employer")]
[ApiController]
[EnableCors("ReactPolicy")]
[Route("api/[controller]")]
public class CompanyController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITalentRecommendationService _talentRecommendationService;

    public CompanyController(
        ApplicationDbContext context,
        ITalentRecommendationService talentRecommendationService)
    {
        _context = context;
        _talentRecommendationService = talentRecommendationService;
    }

    [HttpPost]
    public IActionResult Create(CreateCompanyRequest request)
    {
        var user = _context.Users.Find(request.UserId);

        if (user == null)
        {
            return BadRequest("User not found.");
        }

        bool companyExists = _context.Companies
            .Any(c => c.UserId == request.UserId);

        if (companyExists)
        {
            return BadRequest("This employer already has a company.");
        }

        var company = new Company
        {
            UserId = request.UserId, 
            CompanyName = request.CompanyName,
            Industry = request.Industry,
            Description = request.Description,
            Website = request.Website,
            Location = request.Location
        };

        _context.Companies.Add(company);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Company created successfully.",
            Company = new
            {
                company.CompanyId,
                company.UserId,
                company.CompanyName,
                company.Industry,
                company.Description,
                company.Website,
                company.Location
            }
        });
    }

    [HttpGet("{userId}")]
    public IActionResult GetCompany(int userId)
    {
        var company = _context.Companies
            .Where(c => c.UserId == userId)
            .Select(c => new
            {
                c.CompanyId,
                c.UserId,
                c.CompanyName,
                c.Industry,
                c.Description,
                c.Website,
                c.Location
            })
            .FirstOrDefault();

        if (company == null)
        {
            return NotFound("Company not found.");
        }

        return Ok(company);
    }

    [HttpPut("{userId}")]
    public IActionResult UpdateCompany(
        int userId,
        CreateCompanyRequest request)
    {
        var company = _context.Companies
            .FirstOrDefault(c => c.UserId == userId);

        if (company == null)
        {
            return NotFound("Company not found.");
        }

        company.CompanyName = request.CompanyName;
        company.Industry = request.Industry;
        company.Description = request.Description;
        company.Website = request.Website;
        company.Location = request.Location;

        _context.SaveChanges();

        return Ok(company);
    }

    [HttpDelete("{companyId}")]
    public IActionResult DeleteCompany(int companyId)
    {
        var company = _context.Companies
            .FirstOrDefault(c => c.CompanyId == companyId);

        if (company == null)
        {
            return NotFound("Company not found.");
        }

        _context.Companies.Remove(company);
        _context.SaveChanges();

        return Ok("Company deleted.");
    }

    [HttpGet("recommended-talents")]
    public async Task<IActionResult> GetRecommendedTalents([FromQuery] int limit = 10)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            int userId = int.Parse(userIdClaim.Value);

            var talents = await _talentRecommendationService.GetRecommendedTalentsAsync(userId, limit);

            return Ok(new
            {
                Success = true,
                Data = talents,
                Count = talents.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }
}