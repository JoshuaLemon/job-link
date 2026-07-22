using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

using Microsoft.AspNetCore.Cors;

namespace JobPlatform.API.Controllers;
[EnableCors("ReactPolicy")] 

[ApiController]
[Route("api/[controller]")]
public class ApplicationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    private static readonly string[] AllowedStatuses =
    {
        "Pending",
        "Screening",
        "Interview",
        "Technical Exam",
        "Offer",
        "Hired",
        "Rejected"
    };

    public ApplicationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Employee")]
    [HttpPost]
    public IActionResult Apply(CreateApplicationRequest request)
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
            return BadRequest("Job post not found.");
        }

        // Check if the employee has already applied
        var existingApplication = _context.Applications.FirstOrDefault(a =>
            a.EmployeeProfileId == employee.EmployeeProfileId &&
            a.JobPostId == request.JobPostId);

        if (existingApplication != null)
        {
            return BadRequest("You have already applied for this job.");
        }

        var application = new Application
        {
            EmployeeProfileId = employee.EmployeeProfileId,
            JobPostId = request.JobPostId,
            AppliedAt = DateTime.UtcNow
        };

        _context.Applications.Add(application);
        _context.SaveChanges();

        var response = new ApiResponse<ApplicationResponse>
        {
            Message = "Application submitted successfully.",
            Data = new ApplicationResponse
            {
                ApplicationId = application.ApplicationId,
                EmployeeProfileId = application.EmployeeProfileId,
                JobPostId = application.JobPostId,
                AppliedAt = application.AppliedAt,
                Status = application.Status
            }
        };

        return Ok(response);
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("my-applications")]
    public IActionResult GetMyApplications()
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
            return NotFound("Employee profile not found.");
        }

        var applications = _context.Applications
            .Where(a => a.EmployeeProfileId == employee.EmployeeProfileId)
            .Select(a => new
            {
                a.ApplicationId,
                a.AppliedAt,
                a.Status,
                Job = new
                {
                    a.JobPost!.JobPostId,
                    a.JobPost.Title,
                    a.JobPost.Location,
                    a.JobPost.EmploymentType,
                    a.JobPost.Salary,
                    a.JobPost.PostedAt
                }
            })
            .ToList();

        return Ok(applications);
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("job/{jobPostId}")]
    public IActionResult GetApplicants(int jobPostId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(userIdClaim.Value);

        var company = _context.Companies
            .FirstOrDefault(c => c.UserId == userId);

        if (company == null)
        {
            return BadRequest("Company not found.");
        }

        var job = _context.JobPosts
            .FirstOrDefault(j =>
                j.JobPostId == jobPostId &&
                j.CompanyId == company.CompanyId);

        if (job == null)
        {
            return NotFound("Job not found.");
        }

        var applicants = _context.Applications
            .Where(a => a.JobPostId == jobPostId)
           .Select(a => new
            {
                a.ApplicationId,
                a.AppliedAt,
                a.Status,
                Applicant = new
                {
                    a.EmployeeProfile!.EmployeeProfileId,
                    a.EmployeeProfile.UserId,
                    a.EmployeeProfile.User!.FirstName,
                    a.EmployeeProfile.User.LastName,
                    a.EmployeeProfile.Headline,
                    a.EmployeeProfile.Location
                }
            })
            .ToList();

        return Ok(applicants);
    }
    
    [Authorize(Roles = "Employer")]
    [HttpPut("{applicationId}/status")]
    public IActionResult UpdateStatus(
        int applicationId,
        UpdateApplicationStatusRequest request)
    {
        // Get logged-in employer
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(userIdClaim.Value);

        var company = _context.Companies
            .FirstOrDefault(c => c.UserId == userId);

        if (company == null)
        {
            return BadRequest("Company not found.");
        }

        // Find application
        var application = _context.Applications
            .FirstOrDefault(a => a.ApplicationId == applicationId);

        if (application == null)
        {
            return NotFound("Application not found.");
        }

        // Make sure the job belongs to this company
        var job = _context.JobPosts
            .FirstOrDefault(j =>
                j.JobPostId == application.JobPostId &&
                j.CompanyId == company.CompanyId);

        if (job == null)
        {
            return Forbid();
        }

        if (!AllowedStatuses.Contains(request.Status))
        {
            return BadRequest(new
            {
                Message = "Invalid application status.",
                AllowedStatuses
            });
        }

        application.Status = request.Status;

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Application status updated.",
            Application = new
            {
                application.ApplicationId,
                application.Status
            }
        });
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("dashboard")]
    public IActionResult Dashboard()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(userIdClaim.Value);

        var company = _context.Companies
            .FirstOrDefault(c => c.UserId == userId);

        if (company == null)
        {
            return Ok(new EmployerDashboardResponse
            {
                JobsPosted = 0,
                TotalApplicants = 0,
                Pending = 0,
                Interviews = 0,
                Hired = 0
            });
        }
        var companyJobIds = _context.JobPosts
            .Where(j => j.CompanyId == company.CompanyId)
            .Select(j => j.JobPostId)
            .ToList();

        var applications = _context.Applications
            .Where(a => companyJobIds.Contains(a.JobPostId))
            .ToList();

        var response = new EmployerDashboardResponse
        {
            JobsPosted = companyJobIds.Count,
            TotalApplicants = applications.Count,
            Pending = applications.Count(a => a.Status == "Pending"),
            Interviews = applications.Count(a => a.Status == "Interview"),
            Hired = applications.Count(a => a.Status == "Hired")
        };

        return Ok(response);
    }

}