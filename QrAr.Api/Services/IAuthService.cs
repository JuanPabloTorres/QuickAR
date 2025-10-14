using QrAr.Api.DTOs;

namespace QrAr.Api.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto);
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto);
        Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
        Task<ApiResponse<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileDto updateProfileDto);
        Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto);
        Task<ApiResponse<bool>> LogoutAsync(Guid userId);
    }
}