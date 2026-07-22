using JobPlatform.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Cors;

namespace JobPlatform.API.Controllers;
[EnableCors("ReactPolicy")]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpDelete("me")]
    public IActionResult DeleteMyAccount()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        var user = _context.Users.FirstOrDefault(u => u.UserId == userId);

        if (user == null)
            return NotFound();

        // Delete employee profile if it exists
        var employee = _context.EmployeeProfiles
            .FirstOrDefault(e => e.UserId == userId);

        if (employee != null)
        {
            _context.Applications.RemoveRange(
                _context.Applications.Where(a =>
                    a.EmployeeProfileId == employee.EmployeeProfileId));

            _context.SavedJobs.RemoveRange(
                _context.SavedJobs.Where(s =>
                    s.EmployeeProfileId == employee.EmployeeProfileId));

            _context.Skills.RemoveRange(
                _context.Skills.Where(s =>
                    s.EmployeeProfileId == employee.EmployeeProfileId));

            _context.Experiences.RemoveRange(
                _context.Experiences.Where(e =>
                    e.EmployeeProfileId == employee.EmployeeProfileId));

            _context.Educations.RemoveRange(
                _context.Educations.Where(e =>
                    e.EmployeeProfileId == employee.EmployeeProfileId));

            _context.EmployeeProfiles.Remove(employee);
        }

        // Delete company if it exists
        var company = _context.Companies
            .FirstOrDefault(c => c.UserId == userId);

        if (company != null)
        {
            var jobIds = _context.JobPosts
                .Where(j => j.CompanyId == company.CompanyId)
                .Select(j => j.JobPostId)
                .ToList();

            _context.Applications.RemoveRange(
                _context.Applications.Where(a =>
                    jobIds.Contains(a.JobPostId)));

            _context.JobPosts.RemoveRange(
                _context.JobPosts.Where(j =>
                    j.CompanyId == company.CompanyId));

            _context.Companies.Remove(company);
        }

        _context.Users.Remove(user);

        _context.SaveChanges();

        return Ok(new
        {
            message = "Account deleted successfully."
        });
    }
}