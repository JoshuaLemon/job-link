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
public class SkillController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SkillController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Create(CreateSkillRequest request)
    {
        var profile = _context.EmployeeProfiles.Find(request.EmployeeProfileId);

        if (profile == null)
        {
            return BadRequest("Employee profile not found.");
        }

        var skill = new Skill
        {
            EmployeeProfileId = request.EmployeeProfileId,
            SkillName = request.SkillName
        };

        _context.Skills.Add(skill);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Skill added successfully.",
            Skill = new
            {
                skill.SkillId,
                skill.EmployeeProfileId,
                skill.SkillName
            }
        });
    }


    [HttpGet("my-skills")]
    public IActionResult GetMySkills()
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

        var skills = _context.Skills
            .Where(s => s.EmployeeProfileId == profile.EmployeeProfileId)
            .OrderBy(s => s.SkillName)
            .Select(s => new
            {
                s.SkillId,
                s.EmployeeProfileId,
                s.SkillName
            })
            .ToList();

        return Ok(skills);
    }
    [HttpGet("profile/{profileId}")]
    public IActionResult GetByProfile(int profileId)
    {
        var skills = _context.Skills
            .Where(s => s.EmployeeProfileId == profileId)
            .OrderBy(s => s.SkillName)
            .Select(s => new
            {
                s.SkillId,
                s.EmployeeProfileId,
                s.SkillName
            })
            .ToList();

        return Ok(skills);
    }

    [HttpPut("{skillId}")]
    public IActionResult Update(int skillId, CreateSkillRequest request)
    {
        var skill = _context.Skills.Find(skillId);

        if (skill == null)
        {
            return NotFound("Skill not found.");
        }

        skill.SkillName = request.SkillName;

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Skill updated successfully.",
            Skill = new
            {
                skill.SkillId,
                skill.EmployeeProfileId,
                skill.SkillName
            }
        });
    }

    [HttpDelete("{skillId}")]
    public IActionResult Delete(int skillId)
    {
        var skill = _context.Skills.Find(skillId);

        if (skill == null)
        {
            return NotFound("Skill not found.");
        }

        _context.Skills.Remove(skill);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Skill deleted successfully."
        });
    }
}