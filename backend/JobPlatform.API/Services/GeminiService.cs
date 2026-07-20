using System.Text;
using System.Text.Json;

namespace JobPlatform.API.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    
    // Free tier models only
    private readonly string[] _models = new[]
    {
        "gemini-3.5-flash",        // Best balance - ~10 RPM, 250 RPD
        "gemini-3.1-flash-lite",   // High-volume tasks - ~15 RPM, 1000 RPD
        "gemini-2.5-pro"           // Complex prototyping - ~5 RPM, 100 RPD
    };

    public GeminiService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GenerateResumeAsync(string prompt)
    {
        var apiKey = _configuration["Gemini:ApiKey"] ?? _configuration["Gemini_ApiKey"];
        
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("Gemini API key is not configured.");
        }

        Exception lastException = new Exception("No models attempted");
        
        foreach (var model in _models)
        {
            try
            {
                Console.WriteLine($"Attempting to use model: {model}");
                
                var result = await TryGenerateWithModel(model, apiKey, prompt);
                if (!string.IsNullOrEmpty(result))
                {
                    Console.WriteLine($"Success with model: {model}");
                    return result;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Model {model} failed: {ex.Message}");
                lastException = ex;
                
                // Continue to next model if:
                // - Model not found (404)
                // - Service unavailable (503)
                // - Rate limited (429)
                if (ex.Message.Contains("404") || 
                    ex.Message.Contains("503") || 
                    ex.Message.Contains("429") ||
                    ex.Message.Contains("ServiceUnavailable") ||
                    ex.Message.Contains("NOT_FOUND"))
                {
                    continue;
                }
                
                // For other errors, throw immediately
                throw;
            }
        }

        // If we get here, all models failed
        throw new Exception($"All Gemini models are currently unavailable. Last error: {lastException?.Message}");
    }

    private async Task<string> TryGenerateWithModel(string model, string apiKey, string prompt)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = prompt
                        }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"Model: {model}, Status: {response.StatusCode}");
        Console.WriteLine($"Response: {responseBody}");

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception(
                $"Status: {response.StatusCode}\n\n{responseBody}");
        }

        using var document = JsonDocument.Parse(responseBody);
        var root = document.RootElement;

        var text = root
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? "";
    }
}