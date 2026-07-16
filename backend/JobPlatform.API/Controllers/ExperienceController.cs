using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace JobPlatform.API.Controllers;
[Authorize(Roles = "Employee")]

[ApiController]
[Route("api/[controller]")]
public class ExperienceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ExperienceController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Create(CreateExperienceRequest request)
    {
        var profile = _context.EmployeeProfiles.Find(request.EmployeeProfileId);

        if (profile == null)
        {
            return BadRequest("Employee profile not found.");
        }

        var experience = new Experience
        {
            EmployeeProfileId = request.EmployeeProfileId,
            CompanyName = request.CompanyName,
            JobTitle = request.JobTitle,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        _context.Experiences.Add(experience);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Experience added successfully.",
            Experience = new
            {
                experience.ExperienceId,
                experience.EmployeeProfileId,
                experience.CompanyName,
                experience.JobTitle,
                experience.Description,
                experience.StartDate,
                experience.EndDate
            }
        });
    }

    [HttpGet("my-experience")]
    public IActionResult GetMyExperience()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(userIdClaim.Value);

        var profile = _context.EmployeeProfiles
            .FirstOrDefault(p => p.UserId == userId);

        if (profile == null)
        {
            return NotFound("Employee profile not found.");
        }

        var experiences = _context.Experiences
            .Where(e => e.EmployeeProfileId == profile.EmployeeProfileId)
            .OrderByDescending(e => e.EndDate)
            .Select(e => new
            {
                e.ExperienceId,
                e.EmployeeProfileId,
                e.CompanyName,
                e.JobTitle,
                e.Description,
                e.StartDate,
                e.EndDate
            })
            .ToList();

        return Ok(experiences);
    }

    [HttpGet("profile/{profileId}")]
    public IActionResult GetByProfile(int profileId)
    {
        var experiences = _context.Experiences
            .Where(e => e.EmployeeProfileId == profileId)
            .OrderByDescending(e => e.EndDate)
            .Select(e => new
            {
                e.ExperienceId,
                e.EmployeeProfileId,
                e.CompanyName,
                e.JobTitle,
                e.Description,
                e.StartDate,
                e.EndDate
            })
            .ToList();

        return Ok(experiences);
    }

    [HttpPut("{experienceId}")]
    public IActionResult Update(int experienceId, CreateExperienceRequest request)
    {
        var experience = _context.Experiences.Find(experienceId);

        if (experience == null)
        {
            return NotFound("Experience not found.");
        }

        experience.CompanyName = request.CompanyName;
        experience.JobTitle = request.JobTitle;
        experience.Description = request.Description;
        experience.StartDate = request.StartDate;
        experience.EndDate = request.EndDate;

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Experience updated successfully.",
            Experience = new
            {
                experience.ExperienceId,
                experience.EmployeeProfileId,
                experience.CompanyName,
                experience.JobTitle,
                experience.Description,
                experience.StartDate,
                experience.EndDate
            }
        });
    }

    [HttpDelete("{experienceId}")]
    public IActionResult Delete(int experienceId)
    {
        var experience = _context.Experiences.Find(experienceId);

        if (experience == null)
        {
            return NotFound("Experience not found.");
        }

        _context.Experiences.Remove(experience);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Experience deleted successfully."
        });
    }
}