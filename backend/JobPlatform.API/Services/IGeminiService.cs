namespace JobPlatform.API.Services;

public interface IGeminiService
{
    Task<string> GenerateResumeAsync(string prompt);
}