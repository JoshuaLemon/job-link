using JobPlatform.API.Models;

namespace JobPlatform.API.Services;

public interface ITokenService
{
    string CreateToken(User user);
}