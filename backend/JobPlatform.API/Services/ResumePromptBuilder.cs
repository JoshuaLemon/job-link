using System.Text;
using JobPlatform.API.DTOs;

namespace JobPlatform.API.Services;

public static class ResumePromptBuilder
{
    public static string BuildPrompt(ResumeResponse resume)
    {
        var sb = new StringBuilder();

        sb.AppendLine("You are an expert ATS resume writer.");

        sb.AppendLine();

        sb.AppendLine("Rewrite this resume professionally.");

        sb.AppendLine("Rules:");

        sb.AppendLine("- Keep ATS friendly.");

        sb.AppendLine("- Don't invent information.");

        sb.AppendLine("- Improve wording.");

        sb.AppendLine("- Keep it concise.");

        sb.AppendLine("- Return plain text only.");

        sb.AppendLine();

        sb.AppendLine($"Name: {resume.FirstName} {resume.LastName}");

        sb.AppendLine($"Headline: {resume.Headline}");

        sb.AppendLine($"Location: {resume.Location}");

        sb.AppendLine($"Email: {resume.Email}");

        sb.AppendLine();

        sb.AppendLine("SUMMARY");

        sb.AppendLine(resume.Bio);
        
        sb.AppendLine();

        sb.AppendLine("SKILLS");

        foreach (var skill in resume.Skills)
            sb.AppendLine($"- {skill}");

        sb.AppendLine();

        sb.AppendLine("EXPERIENCE");

        foreach (var exp in resume.Experiences)
        {
            sb.AppendLine(exp.CompanyName);
            sb.AppendLine(exp.JobTitle);
            sb.AppendLine(exp.Description);
            sb.AppendLine();
        }

        sb.AppendLine("EDUCATION");

        foreach (var edu in resume.Educations)
        {
            sb.AppendLine(edu.SchoolName);
            sb.AppendLine(edu.Degree);
            sb.AppendLine(edu.FieldOfStudy);
            sb.AppendLine();
        }

        return sb.ToString();
    }
}