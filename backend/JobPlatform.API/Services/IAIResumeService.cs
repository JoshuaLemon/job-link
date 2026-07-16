using System.Threading.Tasks;
using JobPlatform.API.DTOs;
namespace JobPlatform.API.Services;

public interface IAIResumeService
{
    Task<ResumeResponse> GenerateResumeAsync(int userId);
}