using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

namespace JobPlatform.API.Controllers;

[Authorize(Roles = "Employee")]
[EnableCors("ReactPolicy")]

[ApiController]
[Route("api/[controller]")]
public class EducationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EducationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Create(CreateEducationRequest request)
    {
        try
        {
            // Check if the employee profile exists
            var profile = _context.EmployeeProfiles.Find(request.EmployeeProfileId);

            if (profile == null)
            {
                return BadRequest(new { message = "Employee profile not found." });
            }

            // Convert dates to UTC
            var startDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            var endDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

            // Create the education record
            var education = new Education
            {
                EmployeeProfileId = request.EmployeeProfileId,
                SchoolName = request.SchoolName,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = startDate,
                EndDate = endDate
            };

            _context.Educations.Add(education);
            _context.SaveChanges();

            return Ok(new
            {
                Message = "Education added successfully.",
                Education = new
                {
                    education.EducationId,
                    education.EmployeeProfileId,
                    education.SchoolName,
                    education.Degree,
                    education.FieldOfStudy,
                    education.StartDate,
                    education.EndDate
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [HttpGet("profile/{profileId}")]
    public IActionResult GetByProfile(int profileId)
    {
        var educations = _context.Educations
            .Where(e => e.EmployeeProfileId == profileId)
            .OrderByDescending(e => e.EndDate)
            .Select(e => new
            {
                e.EducationId,
                e.EmployeeProfileId,
                e.SchoolName,
                e.Degree,
                e.FieldOfStudy,
                e.StartDate,
                e.EndDate
            })
            .ToList();

        return Ok(educations);
    }

    [HttpPut("{educationId}")]
    public IActionResult Update(int educationId, CreateEducationRequest request)
    {
        try
        {
            var education = _context.Educations.Find(educationId);

            if (education == null)
            {
                return NotFound("Education not found.");
            }

            // Convert dates to UTC
            var startDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            var endDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

            education.SchoolName = request.SchoolName;
            education.Degree = request.Degree;
            education.FieldOfStudy = request.FieldOfStudy;
            education.StartDate = startDate;
            education.EndDate = endDate;

            _context.SaveChanges();

            return Ok(new
            {
                Message = "Education updated successfully.",
                Education = new
                {
                    education.EducationId,
                    education.EmployeeProfileId,
                    education.SchoolName,
                    education.Degree,
                    education.FieldOfStudy,
                    education.StartDate,
                    education.EndDate
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [HttpDelete("{educationId}")]
    public IActionResult Delete(int educationId)
    {
        try
        {
            var education = _context.Educations.Find(educationId);

            if (education == null)
            {
                return NotFound("Education not found.");
            }

            _context.Educations.Remove(education);
            _context.SaveChanges();

            return Ok(new
            {
                Message = "Education deleted successfully."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", error = ex.Message });
        }
    }

    [HttpGet("my-education")]
    public IActionResult GetMyEducation()
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

        var educations = _context.Educations
            .Where(e => e.EmployeeProfileId == profile.EmployeeProfileId)
            .OrderByDescending(e => e.EndDate)
            .Select(e => new
            {
                e.EducationId,
                e.EmployeeProfileId,
                e.SchoolName,
                e.Degree,
                e.FieldOfStudy,
                e.StartDate,
                e.EndDate
            })
            .ToList();

        return Ok(educations);
    }
}