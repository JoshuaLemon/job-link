using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace JobPlatform.API.Controllers;
[Authorize(Roles = "Employer")]
[ApiController]
[Route("api/[controller]")]
public class CompanyController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CompanyController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Create(CreateCompanyRequest request)
    {
        var user = _context.Users.Find(request.UserId);

        if (user == null)
        {
            return BadRequest("User not found.");
        }

        var company = new Company
        {
            UserId = request.UserId,
            CompanyName = request.CompanyName,
            Industry = request.Industry,
            Description = request.Description,
            Website = request.Website,
            Location = request.Location
        };

        _context.Companies.Add(company);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Company created successfully.",
            Company = new
            {
                company.CompanyId,
                company.UserId,
                company.CompanyName,
                company.Industry,
                company.Description,
                company.Website,
                company.Location
            }
        });
    }
}