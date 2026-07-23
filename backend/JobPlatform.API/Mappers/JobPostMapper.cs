using JobPlatform.API.DTOs;
using JobPlatform.API.Models;

namespace JobPlatform.API.Mappers;

public static class JobPostMapper
{
    public static JobPostResponse ToResponse(this JobPost job)
    {
        return new JobPostResponse
        {
            JobPostId = job.JobPostId,
            Title = job.Title,
            Description = job.Description,
            Location = job.Location,
            Salary = job.Salary,
            EmploymentType = job.EmploymentType,
            PostedAt = job.PostedAt,
            Tags = job.Tags,  // Add this
            CompanyName = job.Company?.CompanyName ?? ""
        };
    }
}