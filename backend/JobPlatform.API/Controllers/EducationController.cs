using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
namespace JobPlatform.API.Controllers;

[Authorize(Roles = "Employee")]
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
        // Check if the employee profile exists
        var profile = _context.EmployeeProfiles.Find(request.EmployeeProfileId);

        if (profile == null)
        {
            return BadRequest("Employee profile not found.");
        }

        // Create the education record
        var education = new Education
        {
            EmployeeProfileId = request.EmployeeProfileId,
            SchoolName = request.SchoolName,
            Degree = request.Degree,
            FieldOfStudy = request.FieldOfStudy,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        // Save to database
        _context.Educations.Add(education);
        _context.SaveChanges();

        // Return only the data we want (avoid JSON circular reference)
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
        var education = _context.Educations.Find(educationId);

        if (education == null)
        {
            return NotFound("Education not found.");
        }

        education.SchoolName = request.SchoolName;
        education.Degree = request.Degree;
        education.FieldOfStudy = request.FieldOfStudy;
        education.StartDate = request.StartDate;
        education.EndDate = request.EndDate;

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

    [HttpDelete("{educationId}")]
    public IActionResult Delete(int educationId)
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