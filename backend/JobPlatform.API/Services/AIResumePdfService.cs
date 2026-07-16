using JobPlatform.API.Documents;
using JobPlatform.API.DTOs;
using QuestPDF.Fluent;
namespace JobPlatform.API.Services;

public class AIResumePdfService : IAIResumePdfService
{
    public Task<byte[]> GeneratePdfAsync(
        ResumeResponse resume)
    {
        var document = new ResumeDocument(resume);

        var pdf = document.GeneratePdf();

        return Task.FromResult(pdf);
    }
}