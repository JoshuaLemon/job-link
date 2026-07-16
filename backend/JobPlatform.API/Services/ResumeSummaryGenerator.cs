using JobPlatform.API.DTOs;
namespace JobPlatform.API.Services;

public static class ResumeSummaryGenerator
{
    public static string Generate(ResumeResponse resume)
    {
        // If the employee already wrote a decent summary, use it.
        if (!string.IsNullOrWhiteSpace(resume.Bio) &&
            resume.Bio.Trim().Length >= 60)
        {
            return resume.Bio.Trim();
        }

        bool hasExperience = resume.Experiences.Any();

        string headline = string.IsNullOrWhiteSpace(resume.Headline)
            ? "Software Developer"
            : resume.Headline;

        string summary;

        if (headline.Contains("Unity", StringComparison.OrdinalIgnoreCase))
        {
            summary = hasExperience
                ? "Experienced Unity Developer with a strong background in designing and developing interactive applications using Unity and C#. Passionate about building engaging gameplay experiences while writing clean, maintainable code."
                : "Motivated Unity Developer with a background in game development and a passion for creating engaging interactive experiences using Unity and C#. Eager to contribute technical skills while continuing to grow as a software developer.";
        }
        else if (headline.Contains("Frontend", StringComparison.OrdinalIgnoreCase))
        {
            summary = hasExperience
                ? "Frontend Developer experienced in building responsive and user-friendly web applications using modern JavaScript frameworks and UI technologies."
                : "Motivated Frontend Developer with knowledge of modern web technologies and a passion for creating responsive, user-friendly interfaces.";
        }
        else if (headline.Contains("Backend", StringComparison.OrdinalIgnoreCase))
        {
            summary = hasExperience
                ? "Backend Developer experienced in building scalable APIs, database-driven applications, and maintainable server-side solutions."
                : "Aspiring Backend Developer with knowledge of API development, relational databases, and software engineering principles.";
        }
        else
        {
            summary = hasExperience
                ? $"Experienced {headline} committed to delivering high-quality solutions while collaborating effectively with cross-functional teams."
                : $"Motivated {headline} eager to apply technical knowledge, continuously learn new technologies, and contribute to a collaborative development team.";
        }

        var skills = resume.Skills.Take(5).ToList();

        if (skills.Any())
        {
            summary += $" Skilled in {string.Join(", ", skills)}.";
        }

        return summary;
    }
}