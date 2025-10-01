using QrAr.Api.DTOs;

namespace QrAr.Api.Services;

public interface IExperienceService
{
    Task<ApiResponse<IEnumerable<ExperienceDto>>> GetAllAsync();
    Task<ApiResponse<ExperienceDto?>> GetByIdAsync(Guid id);
    Task<ApiResponse<ExperienceDto?>> GetBySlugAsync(string slug);
    Task<ApiResponse<ExperienceDto>> CreateAsync(ExperienceCreateDto dto);
    Task<ApiResponse<ExperienceDto>> UpdateAsync(Guid id, ExperienceUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(Guid id);
    Task<ApiResponse<bool>> ToggleActiveAsync(Guid id);
}