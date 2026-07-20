using System.Text;
using System.Text.Json;

namespace JobPlatform.API.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    
    private readonly string[] _models = new[]
    {
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-2.5-pro"
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
        // Try multiple configuration keys
        var apiKey = _configuration["Gemini:ApiKey"] ?? 
                     _configuration["Gemini_ApiKey"] ?? 
                     _configuration["GEMINI_API_KEY"];
        
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("Gemini API key is not configured. Check environment variables.");
        }

        // Log API key status (first few chars only)
        Console.WriteLine($"API Key found: {apiKey.Substring(0, Math.Min(8, apiKey.Length))}...");

        Exception lastException = new Exception("No models attempted");
        
        foreach (var model in _models)
        {
            try
            {
                Console.WriteLine($"Attempting model: {model}");
                
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
                
                // Continue on recoverable errors
                if (ex.Message.Contains("404") || 
                    ex.Message.Contains("503") || 
                    ex.Message.Contains("429") ||
                    ex.Message.Contains("ServiceUnavailable") ||
                    ex.Message.Contains("NOT_FOUND") ||
                    ex.Message.Contains("invalid start"))
                {
                    continue;
                }
                
                throw;
            }
        }

        throw new Exception($"All Gemini models failed. Last error: {lastException.Message}");
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

        try
        {
            var response = await _httpClient.PostAsync(url, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"Model: {model}, Status: {response.StatusCode}");
            Console.WriteLine($"Response length: {responseBody.Length}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Status: {response.StatusCode}\n\n{responseBody}");
            }

            // Handle empty or invalid JSON
            if (string.IsNullOrWhiteSpace(responseBody) || responseBody.StartsWith("<"))
            {
                throw new Exception($"Invalid response: {responseBody.Substring(0, Math.Min(100, responseBody.Length))}...");
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
        catch (JsonException ex)
        {
            throw new Exception($"Invalid JSON response: {ex.Message}");
        }
    }
}