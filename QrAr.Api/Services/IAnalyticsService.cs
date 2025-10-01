using QrAr.Api.DTOs;

namespace QrAr.Api.Services;

public interface IAnalyticsService
{
    Task<ApiResponse<AnalyticsEventDto>> TrackEventAsync(AnalyticsEventCreateDto dto);
    Task<ApiResponse<IEnumerable<AnalyticsEventDto>>> GetEventsAsync(Guid? experienceId = null, int page = 1, int pageSize = 50);
    Task<ApiResponse<Dictionary<string, int>>> GetEventStatsByExperienceAsync(Guid experienceId);
}