using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.API.Services;

public class TalentRecommendationService : ITalentRecommendationService
{
    private readonly ApplicationDbContext _context;

    public TalentRecommendationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<EmployeeProfileResponse>> GetRecommendedTalentsAsync(int userId, int limit = 10)
    {
        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (company == null)
        {
            return new List<EmployeeProfileResponse>();
        }

        var jobPosts = await _context.JobPosts
            .Where(j => j.CompanyId == company.CompanyId)
            .ToListAsync();

        if (jobPosts.Count == 0)
        {
            return new List<EmployeeProfileResponse>();
        }

        var keywords = ExtractKeywordsFromJobs(jobPosts);

        var employees = await _context.EmployeeProfiles
            .Include(p => p.User)
            .Include(p => p.Skills)
            .Include(p => p.Experiences)
            .Include(p => p.Educations)
            .Where(p => p.UserId != userId)
            .ToListAsync();

        var scoredEmployees = employees
            .Select(profile => new
            {
                Profile = profile,
                Score = CalculateRelevanceScore(profile, keywords, jobPosts)
            })
            .Where(e => e.Score > 0)
            .OrderByDescending(e => e.Score)
            .Take(limit)
            .Select(e => new EmployeeProfileResponse
            {
                EmployeeProfileId = e.Profile.EmployeeProfileId,
                UserId = e.Profile.UserId,
                FirstName = e.Profile.User?.FirstName ?? "",
                LastName = e.Profile.User?.LastName ?? "",
                Email = e.Profile.User?.Email ?? "",
                Headline = e.Profile.Headline ?? "",
                Bio = e.Profile.Bio ?? "",
                Location = e.Profile.Location ?? "",
                PhoneNumber = e.Profile.PhoneNumber ?? "",
                Skills = e.Profile.Skills?.Select(s => s.SkillName).ToList() ?? new List<string>(),
                Experiences = e.Profile.Experiences?.Select(exp => new ExperienceDto
                {
                    CompanyName = exp.CompanyName,
                    JobTitle = exp.JobTitle,
                    Description = exp.Description,
                    StartDate = exp.StartDate,
                    EndDate = exp.EndDate
                }).ToList() ?? new List<ExperienceDto>(),
                Educations = e.Profile.Educations?.Select(edu => new EducationDto
                {
                    SchoolName = edu.SchoolName,
                    Degree = edu.Degree,
                    FieldOfStudy = edu.FieldOfStudy,
                    StartDate = edu.StartDate,
                    EndDate = edu.EndDate
                }).ToList() ?? new List<EducationDto>(),
                MatchScore = Math.Round(e.Score, 2)
            })
            .ToList();

        return scoredEmployees;
    }

    public async Task<List<EmployeeProfileResponse>> GetRecommendedTalentsForJobAsync(int jobPostId, int limit = 10)
    {
        var job = await _context.JobPosts
            .FirstOrDefaultAsync(j => j.JobPostId == jobPostId);

        if (job == null)
        {
            return new List<EmployeeProfileResponse>();
        }

        var keywords = ExtractKeywordsFromSingleJob(job);

        var employees = await _context.EmployeeProfiles
            .Include(p => p.User)
            .Include(p => p.Skills)
            .Include(p => p.Experiences)
            .Include(p => p.Educations)
            .ToListAsync();

        var scoredEmployees = employees
            .Select(profile => new
            {
                Profile = profile,
                Score = CalculateRelevanceScoreForJob(profile, keywords, job)
            })
            .Where(e => e.Score > 0)
            .OrderByDescending(e => e.Score)
            .Take(limit)
            .Select(e => new EmployeeProfileResponse
            {
                EmployeeProfileId = e.Profile.EmployeeProfileId,
                UserId = e.Profile.UserId,
                FirstName = e.Profile.User?.FirstName ?? "",
                LastName = e.Profile.User?.LastName ?? "",
                Email = e.Profile.User?.Email ?? "",
                Headline = e.Profile.Headline ?? "",
                Bio = e.Profile.Bio ?? "",
                Location = e.Profile.Location ?? "",
                PhoneNumber = e.Profile.PhoneNumber ?? "",
                Skills = e.Profile.Skills?.Select(s => s.SkillName).ToList() ?? new List<string>(),
                Experiences = e.Profile.Experiences?.Select(exp => new ExperienceDto
                {
                    CompanyName = exp.CompanyName,
                    JobTitle = exp.JobTitle,
                    Description = exp.Description,
                    StartDate = exp.StartDate,
                    EndDate = exp.EndDate
                }).ToList() ?? new List<ExperienceDto>(),
                Educations = e.Profile.Educations?.Select(edu => new EducationDto
                {
                    SchoolName = edu.SchoolName,
                    Degree = edu.Degree,
                    FieldOfStudy = edu.FieldOfStudy,
                    StartDate = edu.StartDate,
                    EndDate = edu.EndDate
                }).ToList() ?? new List<EducationDto>(),
                MatchScore = Math.Round(e.Score, 2)
            })
            .ToList();

        return scoredEmployees;
    }

    private Dictionary<string, int> ExtractKeywordsFromJobs(List<JobPost> jobs)
    {
        var keywords = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var job in jobs)
        {
            var titleWords = job.Title.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var word in titleWords)
            {
                if (!keywords.ContainsKey(word))
                    keywords[word] = 0;
                keywords[word] += 3;
            }

            if (!string.IsNullOrEmpty(job.Description))
            {
                var descWords = job.Description
                    .Replace("\n", " ")
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Where(w => w.Length > 3)
                    .Take(50);
                foreach (var word in descWords)
                {
                    if (!keywords.ContainsKey(word))
                        keywords[word] = 0;
                    keywords[word] += 1;
                }
            }

            if (!string.IsNullOrEmpty(job.Tags))
            {
                var tagWords = job.Tags.Split(',').Select(t => t.Trim());
                foreach (var tag in tagWords)
                {
                    if (!keywords.ContainsKey(tag))
                        keywords[tag] = 0;
                    keywords[tag] += 4;
                }
            }

            if (!string.IsNullOrEmpty(job.Location))
            {
                if (!keywords.ContainsKey(job.Location))
                    keywords[job.Location] = 0;
                keywords[job.Location] += 3;
            }

            if (!string.IsNullOrEmpty(job.EmploymentType))
            {
                if (!keywords.ContainsKey(job.EmploymentType))
                    keywords[job.EmploymentType] = 0;
                keywords[job.EmploymentType] += 2;
            }
        }

        return keywords;
    }

    private Dictionary<string, int> ExtractKeywordsFromSingleJob(JobPost job)
    {
        var keywords = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        var titleWords = job.Title.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in titleWords)
        {
            if (!keywords.ContainsKey(word))
                keywords[word] = 0;
            keywords[word] += 3;
        }

        if (!string.IsNullOrEmpty(job.Description))
        {
            var descWords = job.Description
                .Replace("\n", " ")
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 3)
                .Take(50);
            foreach (var word in descWords)
            {
                if (!keywords.ContainsKey(word))
                    keywords[word] = 0;
                keywords[word] += 1;
            }
        }

        if (!string.IsNullOrEmpty(job.Tags))
        {
            var tagWords = job.Tags.Split(',').Select(t => t.Trim());
            foreach (var tag in tagWords)
            {
                if (!keywords.ContainsKey(tag))
                    keywords[tag] = 0;
                keywords[tag] += 4;
            }
        }

        if (!string.IsNullOrEmpty(job.Location))
        {
            if (!keywords.ContainsKey(job.Location))
                keywords[job.Location] = 0;
            keywords[job.Location] += 3;
        }

        if (!string.IsNullOrEmpty(job.EmploymentType))
        {
            if (!keywords.ContainsKey(job.EmploymentType))
                keywords[job.EmploymentType] = 0;
            keywords[job.EmploymentType] += 2;
        }

        return keywords;
    }

    private double CalculateRelevanceScore(EmployeeProfile profile, Dictionary<string, int> keywords, List<JobPost> jobs)
    {
        double score = 0;
        var textToMatch = $"{profile.Headline} {profile.Bio}";

        foreach (var keyword in keywords)
        {
            if (textToMatch.Contains(keyword.Key, StringComparison.OrdinalIgnoreCase))
            {
                score += keyword.Value * 1.5;
            }
        }

        foreach (var skill in profile.Skills ?? new List<Skill>())
        {
            foreach (var keyword in keywords)
            {
                if (skill.SkillName.Contains(keyword.Key, StringComparison.OrdinalIgnoreCase) ||
                    keyword.Key.Contains(skill.SkillName, StringComparison.OrdinalIgnoreCase))
                {
                    score += keyword.Value * 2;
                }
            }
        }

        foreach (var exp in profile.Experiences ?? new List<Experience>())
        {
            var expText = $"{exp.JobTitle} {exp.Description}";
            foreach (var keyword in keywords)
            {
                if (expText.Contains(keyword.Key, StringComparison.OrdinalIgnoreCase))
                {
                    score += keyword.Value * 1.5;
                }
            }
        }

        if (!string.IsNullOrEmpty(profile.Location))
        {
            foreach (var job in jobs)
            {
                if (!string.IsNullOrEmpty(job.Location) &&
                    job.Location.Contains(profile.Location, StringComparison.OrdinalIgnoreCase))
                {
                    score += 5;
                    break;
                }
            }
        }

        return score;
    }

    private double CalculateRelevanceScoreForJob(EmployeeProfile profile, Dictionary<string, int> keywords, JobPost job)
    {
        double score = 0;
        var textToMatch = $"{profile.Headline} {profile.Bio}";

        foreach (var keyword in keywords)
        {
            if (textToMatch.Contains(keyword.Key, StringComparison.OrdinalIgnoreCase))
            {
                score += keyword.Value * 1.5;
            }
        }

        foreach (var skill in profile.Skills ?? new List<Skill>())
        {
            foreach (var keyword in keywords)
            {
                if (skill.SkillName.Contains(keyword.Key, StringComparison.OrdinalIgnoreCase) ||
                    keyword.Key.Contains(skill.SkillName, StringComparison.OrdinalIgnoreCase))
                {
                    score += keyword.Value * 2;
                }
            }
        }

        foreach (var exp in profile.Experiences ?? new List<Experience>())
        {
            var expText = $"{exp.JobTitle} {exp.Description}";
            foreach (var keyword in keywords)
            {
                if (expText.Contains(keyword.Key, StringComparison.OrdinalIgnoreCase))
                {
                    score += keyword.Value * 1.5;
                }
            }
        }

        if (!string.IsNullOrEmpty(profile.Location) && !string.IsNullOrEmpty(job.Location))
        {
            if (job.Location.Contains(profile.Location, StringComparison.OrdinalIgnoreCase))
            {
                score += 5;
            }
        }

        return score;
    }
}