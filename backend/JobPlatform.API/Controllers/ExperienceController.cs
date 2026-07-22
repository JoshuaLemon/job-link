using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Cors;

namespace JobPlatform.API.Controllers;

[Authorize(Roles = "Employee")]
[EnableCors("ReactPolicy")]
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
        try
        {
            var profile = _context.EmployeeProfiles.Find(request.EmployeeProfileId);

            if (profile == null)
            {
                return BadRequest(new { message = "Employee profile not found." });
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.CompanyName))
            {
                return BadRequest(new { message = "Company name is required." });
            }
            if (string.IsNullOrWhiteSpace(request.JobTitle))
            {
                return BadRequest(new { message = "Job title is required." });
            }

            // Convert dates to UTC
            var startDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            var endDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

            var experience = new Experience
            {
                EmployeeProfileId = request.EmployeeProfileId,
                CompanyName = request.CompanyName.Trim(),
                JobTitle = request.JobTitle.Trim(),
                Description = request.Description?.Trim() ?? string.Empty,
                StartDate = startDate,
                EndDate = endDate
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [HttpGet("my-experience")]
    public IActionResult GetMyExperience()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            int userId = int.Parse(userIdClaim.Value);

            var profile = _context.EmployeeProfiles
                .FirstOrDefault(p => p.UserId == userId);

            if (profile == null)
            {
                return NotFound(new { message = "Employee profile not found." });
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [HttpGet("profile/{profileId}")]
    public IActionResult GetByProfile(int profileId)
    {
        try
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [HttpPut("{experienceId}")]
    public IActionResult Update(int experienceId, CreateExperienceRequest request)
    {
        try
        {
            var experience = _context.Experiences.Find(experienceId);

            if (experience == null)
            {
                return NotFound(new { message = "Experience not found." });
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.CompanyName))
            {
                return BadRequest(new { message = "Company name is required." });
            }
            if (string.IsNullOrWhiteSpace(request.JobTitle))
            {
                return BadRequest(new { message = "Job title is required." });
            }

            // Convert dates to UTC
            var startDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            var endDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

            experience.CompanyName = request.CompanyName.Trim();
            experience.JobTitle = request.JobTitle.Trim();
            experience.Description = request.Description?.Trim() ?? string.Empty;
            experience.StartDate = startDate;
            experience.EndDate = endDate;

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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [HttpDelete("{experienceId}")]
    public IActionResult Delete(int experienceId)
    {
        try
        {
            var experience = _context.Experiences.Find(experienceId);

            if (experience == null)
            {
                return NotFound(new { message = "Experience not found." });
            }

            _context.Experiences.Remove(experience);
            _context.SaveChanges();

            return Ok(new
            {
                Message = "Experience deleted successfully."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }
}