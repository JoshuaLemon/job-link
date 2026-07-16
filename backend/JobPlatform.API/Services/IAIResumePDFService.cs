namespace JobPlatform.API.Services;
using JobPlatform.API.DTOs;

public interface IAIResumePdfService
{
    Task<byte[]> GeneratePdfAsync(ResumeResponse resume);
}