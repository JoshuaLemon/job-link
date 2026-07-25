using JobPlatform.API.DTOs;

namespace JobPlatform.API.Services;

public interface ITalentRecommendationService
{
    Task<List<EmployeeProfileResponse>> GetRecommendedTalentsAsync(int userId, int limit = 10);
}