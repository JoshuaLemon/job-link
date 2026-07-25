using JobPlatform.API.DTOs;

namespace JobPlatform.API.Services;

public interface ITalentRecommendationService
{
    Task<List<EmployeeProfileResponse>> GetRecommendedTalentsAsync(int userId, int limit = 10);
    Task<List<EmployeeProfileResponse>> GetRecommendedTalentsForJobAsync(int jobPostId, int limit = 10);
}