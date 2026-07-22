using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuestPDF.Fluent;
using JobPlatform.API.Documents;
using Microsoft.AspNetCore.Cors;

namespace JobPlatform.API.Controllers;
[EnableCors("ReactPolicy")]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProfileController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Create(CreateProfileRequest request)
    {
        // Make sure the user exists
        var user = _context.Users.Find(request.UserId);

        if (user == null)
        {
            return BadRequest("User not found.");
        }

        // Make sure the user doesn't already have a profile
        bool profileExists = _context.EmployeeProfiles
            .Any(p => p.UserId == request.UserId);

        if (profileExists)
        {
            return BadRequest("This user already has a profile.");
        }

        var profile = new EmployeeProfile
        {
            UserId = request.UserId,
            Headline = request.Headline,
            Bio = request.Bio,
            Location = request.Location,
            PhoneNumber = request.PhoneNumber
        };

        _context.EmployeeProfiles.Add(profile);

        _context.SaveChanges();

        return Ok(profile);
    }

    [HttpGet("{userId}")]
    public IActionResult GetProfile(int userId)
    {
        var profile = _context.EmployeeProfiles

            .Where(p => p.UserId == userId)

            .Select(p => new
            {
                p.EmployeeProfileId,

                p.UserId,

                FirstName = p.User!.FirstName,

                LastName = p.User.LastName,

                Email = p.User.Email,

                p.Headline,

                p.Bio,

                p.Location,

                p.PhoneNumber,

                Educations = p.Educations,

                Experiences = p.Experiences,

                Skills = p.Skills
            })

            .FirstOrDefault();

        if (profile == null)
        {
            return NotFound("Profile not found.");
        }

        return Ok(profile);
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("employee/{employeeProfileId}")]
    public IActionResult GetEmployeeProfile(int employeeProfileId)
    {
        var profile = _context.EmployeeProfiles

            .Where(p => p.EmployeeProfileId == employeeProfileId)

            .Select(p => new
            {
                p.EmployeeProfileId,

                FirstName = p.User!.FirstName,

                LastName = p.User.LastName,

                Email = p.User.Email,

                p.Headline,

                p.Bio,

                p.Location,

                p.PhoneNumber,

                Educations = p.Educations
                    .OrderByDescending(e => e.EndDate)
                    .Select(e => new
                    {
                        e.EducationId,
                        e.SchoolName,
                        e.Degree,
                        e.FieldOfStudy,
                        e.StartDate,
                        e.EndDate
                    }),

                Experiences = p.Experiences
                    .OrderByDescending(e => e.EndDate)
                    .Select(e => new
                    {
                        e.ExperienceId,
                        e.CompanyName,
                        e.JobTitle,
                        e.Description,
                        e.StartDate,
                        e.EndDate
                    }),

                Skills = p.Skills
                    .OrderBy(s => s.SkillName)
                    .Select(s => new
                    {
                        s.SkillId,
                        s.SkillName
                    })
            })

            .FirstOrDefault();

        if (profile == null)
        {
            return NotFound("Employee profile not found.");
        }

        return Ok(profile);
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("resume/{userId}")]
    public IActionResult GetResume(int userId)
    {
        var profile = _context.EmployeeProfiles

            .Where(p => p.UserId == userId)

            .Select(p => new ResumeResponse
            {
                FirstName = p.User!.FirstName,
                LastName = p.User.LastName,
                Email = p.User.Email,
                PhoneNumber = p.PhoneNumber,
                Location = p.Location,
                Headline = p.Headline,
                Bio = p.Bio,

                Educations = p.Educations

                    .OrderByDescending(e => e.EndDate)

                    .Select(e => new EducationDto
                    {
                        SchoolName = e.SchoolName,
                        Degree = e.Degree,
                        FieldOfStudy = e.FieldOfStudy,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate
                    })

                    .ToList(),

                Experiences = p.Experiences

                    .OrderByDescending(e => e.EndDate)

                    .Select(e => new ExperienceDto
                    {
                        CompanyName = e.CompanyName,
                        JobTitle = e.JobTitle,
                        Description = e.Description,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate
                    })

                    .ToList(),

                Skills = p.Skills

                    .OrderBy(s => s.SkillName)

                    .Select(s => s.SkillName)

                    .ToList()
            })

            .FirstOrDefault();

        if (profile == null)
        {
            return NotFound("Resume not found.");
        }

        return Ok(profile);
    }
    [Authorize(Roles = "Employee")]
    [HttpGet("resume-pdf/{userId}")]
    public IActionResult DownloadResumePdf(int userId)
    {
        var resume = _context.EmployeeProfiles

            .Where(p => p.UserId == userId)

            .Select(p => new ResumeResponse
            {
                FirstName = p.User!.FirstName,
                LastName = p.User.LastName,
                Email = p.User.Email,
                PhoneNumber = p.PhoneNumber,
                Location = p.Location,
                Headline = p.Headline,
                Bio = p.Bio,

                Educations = p.Educations

                    .OrderByDescending(e => e.EndDate)

                    .Select(e => new EducationDto
                    {
                        SchoolName = e.SchoolName,
                        Degree = e.Degree,
                        FieldOfStudy = e.FieldOfStudy,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate
                    })

                    .ToList(),

                Experiences = p.Experiences

                    .OrderByDescending(e => e.EndDate)

                    .Select(e => new ExperienceDto
                    {
                        CompanyName = e.CompanyName,
                        JobTitle = e.JobTitle,
                        Description = e.Description,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate
                    })

                    .ToList(),

                Skills = p.Skills

                    .OrderBy(s => s.SkillName)

                    .Select(s => s.SkillName)

                    .ToList()
            })

            .FirstOrDefault();
            if (resume == null)
        {
            return NotFound("Resume not found.");
        }

        var document = new ResumeDocument(resume);

        var pdf = document.GeneratePdf();

        return File(
            pdf,
            "application/pdf",
            $"{resume.FirstName}_{resume.LastName}_Resume.pdf"
        );
    }
    [HttpPut("{userId}")]
    public IActionResult UpdateProfile(int userId, CreateProfileRequest request)
    {
        var profile = _context.EmployeeProfiles
            .FirstOrDefault(p => p.UserId == userId);

        if (profile == null)
        {
            return NotFound("Profile not found.");
        }

        profile.Headline = request.Headline;
        profile.Bio = request.Bio;
        profile.Location = request.Location;
        profile.PhoneNumber = request.PhoneNumber;

        _context.SaveChanges();

        return Ok(profile);
    }
}