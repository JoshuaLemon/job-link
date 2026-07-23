using JobPlatform.API.DTOs;

namespace JobPlatform.API.Services;

public interface IJobRecommendationService
{
    Task<List<JobPostResponse>> GetRecommendedJobsAsync(int userId, int limit = 10);
}