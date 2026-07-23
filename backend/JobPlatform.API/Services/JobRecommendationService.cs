using JobPlatform.API.Data;
using JobPlatform.API.DTOs;
using JobPlatform.API.Mappers;
using JobPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.API.Services;

public class JobRecommendationService : IJobRecommendationService
{
    private readonly ApplicationDbContext _context;

    public JobRecommendationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<JobPostResponse>> GetRecommendedJobsAsync(int userId, int limit = 10)
    {
        // Get employee profile with related data
        var profile = await _context.EmployeeProfiles
            .Include(p => p.Skills)
            .Include(p => p.Experiences)
            .Include(p => p.Educations)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            return new List<JobPostResponse>();
        }

        // Extract keywords from profile
        var keywords = ExtractKeywords(profile);

        // Get all job posts
        var jobs = await _context.JobPosts
            .Include(j => j.Company)
            .Where(j => j.PostedAt > DateTime.UtcNow.AddMonths(-3))
            .ToListAsync();

        // Score each job
        var scoredJobs = jobs
            .Select(job => new
            {
                Job = job,
                Score = CalculateRelevanceScore(job, profile, keywords)
            })
            .Where(j => j.Score > 0)
            .OrderByDescending(j => j.Score)
            .Take(limit)
            .Select(j => j.Job.ToResponse())
            .ToList();

        return scoredJobs;
    }

    private Dictionary<string, int> ExtractKeywords(EmployeeProfile profile)
    {
        var keywords = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        // Add skills (highest weight)
        foreach (var skill in profile.Skills ?? new List<Skill>())
        {
            var words = skill.SkillName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var word in words)
            {
                if (!keywords.ContainsKey(word))
                    keywords[word] = 0;
                keywords[word] += 3;
            }
        }

        // Add headline words (medium weight)
        if (!string.IsNullOrEmpty(profile.Headline))
        {
            var words = profile.Headline.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var word in words)
            {
                if (!keywords.ContainsKey(word))
                    keywords[word] = 0;
                keywords[word] += 2;
            }
        }

        // Add bio words (lower weight)
        if (!string.IsNullOrEmpty(profile.Bio))
        {
            var words = profile.Bio
                .Replace("\n", " ")
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 3)
                .Take(30);
            foreach (var word in words)
            {
                if (!keywords.ContainsKey(word))
                    keywords[word] = 0;
                keywords[word] += 1;
            }
        }

        // Add experience job titles (medium weight)
        foreach (var exp in profile.Experiences ?? new List<Experience>())
        {
            if (!string.IsNullOrEmpty(exp.JobTitle))
            {
                var words = exp.JobTitle.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                foreach (var word in words)
                {
                    if (!keywords.ContainsKey(word))
                        keywords[word] = 0;
                    keywords[word] += 2;
                }
            }
        }

        return keywords;
    }

    private double CalculateRelevanceScore(JobPost job, EmployeeProfile profile, Dictionary<string, int> keywords)
    {
        double score = 0;
        var textToMatch = $"{job.Title} {job.Description} {job.Tags ?? ""}".ToLower();

        // Check against keywords
        foreach (var keyword in keywords)
        {
            if (textToMatch.Contains(keyword.Key.ToLower()))
            {
                score += keyword.Value;
            }
        }

        // Location bonus (if job location matches profile location)
        if (!string.IsNullOrEmpty(profile.Location) && 
            !string.IsNullOrEmpty(job.Location) &&
            job.Location.Contains(profile.Location, StringComparison.OrdinalIgnoreCase))
        {
            score += 5;
        }

        // Employment type bonus (if user has experience with similar type)
        if (!string.IsNullOrEmpty(job.EmploymentType))
        {
            foreach (var exp in profile.Experiences ?? new List<Experience>())
            {
                // Check if job title contains similar words to experience
                if (!string.IsNullOrEmpty(exp.JobTitle))
                {
                    var expWords = exp.JobTitle.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    var titleWords = job.Title.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var eWord in expWords)
                    {
                        if (titleWords.Any(t => t.Contains(eWord, StringComparison.OrdinalIgnoreCase) || 
                                               eWord.Contains(t, StringComparison.OrdinalIgnoreCase)))
                        {
                            score += 1;
                        }
                    }
                }
            }
        }

        // Tags bonus (if job tags match skills)
        if (!string.IsNullOrEmpty(job.Tags))
        {
            var jobTags = job.Tags.Split(',').Select(t => t.Trim().ToLower());
            foreach (var skill in profile.Skills ?? new List<Skill>())
            {
                if (jobTags.Any(t => t.Contains(skill.SkillName.ToLower())))
                {
                    score += 2;
                }
            }
        }

        return score;
    }
}