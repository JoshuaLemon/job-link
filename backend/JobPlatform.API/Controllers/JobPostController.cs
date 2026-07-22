using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using JobPlatform.API.Mappers;
namespace JobPlatform.API.Controllers;
using Microsoft.AspNetCore.Cors;

[EnableCors("ReactPolicy")]
[ApiController]
[Route("api/[controller]")]
public class JobPostController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public JobPostController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Employer")]
    [HttpPost]
    public IActionResult Create(CreateJobPostRequest request)
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
             return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Company not found."
            });
        }

        var job = new JobPost
        {
            CompanyId = company.CompanyId,
            Title = request.Title,
            Description = request.Description,
            Location = request.Location,
            Salary = request.Salary,
            EmploymentType = request.EmploymentType,
            PostedAt = DateTime.UtcNow
        };

        _context.JobPosts.Add(job);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Job posted successfully.",
            Job = job.ToResponse()
        });
    }

    [HttpGet]
    public IActionResult GetAll(
        string? title,
        string? location,
        string? employmentType,
        string? sortBy = "postedAt",
        string? sortOrder = "desc",
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.JobPosts.AsQueryable();

        // Search by title
        if (!string.IsNullOrWhiteSpace(title))
        {
            query = query.Where(j => j.Title.Contains(title));
        }

        // Filter by location
        if (!string.IsNullOrWhiteSpace(location))
        {
            query = query.Where(j => j.Location.Contains(location));
        }

        // Filter by employment type
        if (!string.IsNullOrWhiteSpace(employmentType))
        {
            query = query.Where(j => j.EmploymentType == employmentType);
        }

        // Sorting
        switch (sortBy?.ToLower())
        {
            case "salary":
                query = sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(j => j.Salary)
                    : query.OrderByDescending(j => j.Salary);
                break;

            case "title":
                query = sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(j => j.Title)
                    : query.OrderByDescending(j => j.Title);
                break;

            case "location":
                query = sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(j => j.Location)
                    : query.OrderByDescending(j => j.Location);
                break;

            default:
                query = sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(j => j.PostedAt)
                    : query.OrderByDescending(j => j.PostedAt);
                break;
        }

        // Pagination metadata
        var totalItems = query.Count();
        var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        // Pagination
        query = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize);

        var jobs = query
            .AsEnumerable()
            .Select(job => job.ToResponse())
            .ToList();
            
        return Ok(new
        {
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Data = jobs
        });
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("my-jobs")]
    public IActionResult GetMyJobs()
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
            return Ok(new List<JobPostResponse>());
        }

        var jobs = _context.JobPosts
            .Where(j => j.CompanyId == company.CompanyId)
            .OrderByDescending(j => j.PostedAt)
            .Select(j => j.ToResponse())
            .ToList();

        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var job = _context.JobPosts
            .Where(j => j.JobPostId == id)
            .AsEnumerable()
            .Select(job => job.ToResponse())
            .FirstOrDefault();

        if (job == null)
        {
             return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Job not found."
            });
        }

        return Ok(job);
    }
    [Authorize(Roles = "Employer")]
    [HttpPut("{id}")]
    public IActionResult Update(int id, UpdateJobPostRequest request)
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
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Company not found."
            });
        }

        var job = _context.JobPosts
            .FirstOrDefault(j =>
                j.JobPostId == id &&
                j.CompanyId == company.CompanyId);

        if (job == null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Job not found."
            });
        }

        job.Title = request.Title;
        job.Description = request.Description;
        job.Location = request.Location;
        job.Salary = request.Salary;
        job.EmploymentType = request.EmploymentType;

        _context.SaveChanges();

       return Ok(new ApiResponse<JobPostResponse>
        {
            Success = true,
            Message = "Job updated successfully.",
            Data = job.ToResponse()
        });
    }
    [Authorize(Roles = "Employer")]
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
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
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Company not found."
            });
        }

        var job = _context.JobPosts
            .FirstOrDefault(j =>
                j.JobPostId == id &&
                j.CompanyId == company.CompanyId);

        if (job == null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Job not found."
            });
        }

        _context.JobPosts.Remove(job);
        _context.SaveChanges();

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Job deleted successfully.",
            Data = null
        });
    }
}