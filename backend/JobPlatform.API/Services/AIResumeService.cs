using System.Text.Json;
using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.API.Services;

public class AIResumeService : IAIResumeService
{
    private readonly ApplicationDbContext _context;
    private readonly IGeminiService _geminiService;

    public AIResumeService(
        ApplicationDbContext context,
        IGeminiService geminiService)
    {
        _context = context;
        _geminiService = geminiService;
    }

    public async Task<ResumeResponse> GenerateResumeAsync(int userId)
    {
        var profile = await _context.EmployeeProfiles
            .Include(p => p.User)
            .Include(p => p.Educations)
            .Include(p => p.Experiences)
            .Include(p => p.Skills)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
            throw new Exception("Employee profile not found.");

        // Original resume from database
        var resume = new ResumeResponse
        {
            FirstName = profile.User!.FirstName,
            LastName = profile.User.LastName,
            Email = profile.User.Email,

            PhoneNumber = profile.PhoneNumber,
            Location = profile.Location,
            Headline = profile.Headline,
            Bio = profile.Bio,

            Skills = profile.Skills
                .Select(s => s.SkillName)
                .ToList(),

            Educations = profile.Educations
                .Select(e => new EducationDto
                {
                    SchoolName = e.SchoolName,
                    Degree = e.Degree,
                    FieldOfStudy = e.FieldOfStudy,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate
                })
                .ToList(),

            Experiences = profile.Experiences
                .Select(e => new ExperienceDto
                {
                    CompanyName = e.CompanyName,
                    JobTitle = e.JobTitle,
                    Description = e.Description,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate
                })
                .ToList()
        };

        var prompt = $@"
You are an expert ATS resume writer.

Improve this resume.

Rules:

- Do NOT invent information.
- Do NOT change names.
- Do NOT change emails.
- Do NOT change phone numbers.
- Do NOT change locations.
- Do NOT change dates.
- Do NOT change company names.
- Do NOT change school names.
- Do NOT change degrees.

Improve ONLY:

- Headline
- Professional Summary
- Experience descriptions

Return ONLY valid JSON.

Return EXACTLY this structure:

{{
  ""headline"": """",
  ""bio"": """",
  ""experiences"": [
    {{
      ""description"": """"
    }}
  ]
}}

Headline:
{resume.Headline}

Professional Summary:
{resume.Bio}

Experience:

{string.Join("\n\n",
resume.Experiences.Select(e =>
$@"Company:
{e.CompanyName}

Job Title:
{e.JobTitle}

Description:
{e.Description}"))}
";

        var json = await _geminiService.GenerateResumeAsync(prompt);

        Console.WriteLine("========== GEMINI ==========");
        Console.WriteLine(json);
        Console.WriteLine("============================");

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var aiResume =
            JsonSerializer.Deserialize<AIResumeResponse>(
                json,
                options);

        if (aiResume == null)
            throw new Exception("Gemini returned invalid JSON.");

        // Replace ONLY the improved fields

        if (!string.IsNullOrWhiteSpace(aiResume.Headline))
            resume.Headline = aiResume.Headline;

        if (!string.IsNullOrWhiteSpace(aiResume.Bio))
            resume.Bio = aiResume.Bio;

        for (int i = 0;
             i < resume.Experiences.Count &&
             i < aiResume.Experiences.Count;
             i++)
        {
            if (!string.IsNullOrWhiteSpace(aiResume.Experiences[i].Description))
            {
                resume.Experiences[i].Description =
                    aiResume.Experiences[i].Description;
            }
        }

        resume.IsAIGenerated = true;

        return resume;
    }
}