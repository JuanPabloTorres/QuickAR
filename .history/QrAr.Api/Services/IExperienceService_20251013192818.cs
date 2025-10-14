using QrAr.Api.DTOs;

namespace QrAr.Api.Services;

public interface IExperienceService
{
    // Public endpoints (no auth required)
    Task<ApiResponse<ExperienceDto?>> GetByIdAsync(Guid id);
    Task<ApiResponse<ExperienceDto?>> GetBySlugAsync(string slug);

    // User-specific endpoints (auth required)
    Task<ApiResponse<IEnumerable<ExperienceDto>>> GetAllAsync();
    Task<ApiResponse<IEnumerable<ExperienceDto>>> GetAllByUserIdAsync(Guid userId);
    Task<ApiResponse<ExperienceDto>> CreateAsync(ExperienceCreateDto dto, Guid userId);
    Task<ApiResponse<ExperienceDto>> UpdateAsync(Guid id, ExperienceUpdateDto dto, Guid userId);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, Guid userId);
    Task<ApiResponse<bool>> ToggleActiveAsync(Guid id, Guid userId);
}