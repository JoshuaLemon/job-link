using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employee")]
public class SavedJobController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SavedJobController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Save(CreateSavedJobRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(userIdClaim.Value);

        var employee = _context.EmployeeProfiles
            .FirstOrDefault(e => e.UserId == userId);

        if (employee == null)
        {
            return BadRequest("Employee profile not found.");
        }

        var job = _context.JobPosts.Find(request.JobPostId);

        if (job == null)
        {
            return BadRequest("Job not found.");
        }

        var existing = _context.SavedJobs.FirstOrDefault(s =>
            s.EmployeeProfileId == employee.EmployeeProfileId &&
            s.JobPostId == request.JobPostId);

        if (existing != null)
        {
            return BadRequest("Job already saved.");
        }

        var savedJob = new SavedJob
        {
            EmployeeProfileId = employee.EmployeeProfileId,
            JobPostId = request.JobPostId,
            SavedAt = DateTime.UtcNow
        };

        _context.SavedJobs.Add(savedJob);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Job saved successfully."
        });
    }

    [HttpGet]
    public IActionResult GetSavedJobs()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(userIdClaim.Value);

        var employee = _context.EmployeeProfiles
            .FirstOrDefault(e => e.UserId == userId);

        if (employee == null)
        {
            return BadRequest("Employee profile not found.");
        }

        var jobs = _context.SavedJobs
            .Where(s => s.EmployeeProfileId == employee.EmployeeProfileId)
            .Select(s => new
            {
                s.SavedJobId,
                s.SavedAt,
                Job = new
                {
                    s.JobPost!.JobPostId,
                    s.JobPost.Title,
                    s.JobPost.Location,
                    s.JobPost.Salary,
                    s.JobPost.EmploymentType
                }
            })
            .ToList();

        return Ok(jobs);
    }

   [HttpDelete("{jobPostId}")]
    public IActionResult Remove(int jobPostId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(userIdClaim.Value);

        var employee = _context.EmployeeProfiles
            .FirstOrDefault(e => e.UserId == userId);

        if (employee == null)
        {
            return BadRequest("Employee profile not found.");
        }

        var savedJob = _context.SavedJobs
            .FirstOrDefault(s =>
                s.EmployeeProfileId == employee.EmployeeProfileId &&
                s.JobPostId == jobPostId);

        if (savedJob == null)
        {
            return NotFound("Saved job not found.");
        }

        _context.SavedJobs.Remove(savedJob);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Saved job removed."
        });
    }
}