using Microsoft.EntityFrameworkCore;
using QrAr.Api.Data;
using QrAr.Api.DTOs;
using QrAr.Api.Models;

namespace QrAr.Api.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _context;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(AppDbContext context, ILogger<AnalyticsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<AnalyticsEventDto>> TrackEventAsync(AnalyticsEventCreateDto dto)
    {
        try
        {
            // Verify experience exists
            var experienceExists = await _context.Experiences.AnyAsync(e => e.Id == dto.ExperienceId);
            if (!experienceExists)
            {
                return ApiResponse<AnalyticsEventDto>.ErrorResult("Experience not found");
            }

            var analyticsEvent = new AnalyticsEvent
            {
                EventType = dto.EventType,
                ExperienceId = dto.ExperienceId,
                UserAgent = dto.UserAgent,
                IpAddress = dto.IpAddress,
                Referrer = dto.Referrer,
                AdditionalData = dto.AdditionalData
            };

            _context.AnalyticsEvents.Add(analyticsEvent);
            await _context.SaveChangesAsync();

            var result = new AnalyticsEventDto(
                analyticsEvent.Id,
                analyticsEvent.EventType,
                analyticsEvent.ExperienceId,
                analyticsEvent.UserAgent,
                analyticsEvent.IpAddress,
                analyticsEvent.Referrer,
                analyticsEvent.AdditionalData,
                analyticsEvent.CreatedAt
            );

            _logger.LogInformation("Analytics event tracked: {EventType} for experience: {ExperienceId}",
                dto.EventType, dto.ExperienceId);

            return ApiResponse<AnalyticsEventDto>.SuccessResult(result, "Event tracked successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking analytics event: {EventType}", dto.EventType);
            return ApiResponse<AnalyticsEventDto>.ErrorResult("Error tracking event");
        }
    }

    public async Task<ApiResponse<IEnumerable<AnalyticsEventDto>>> GetEventsAsync(Guid? experienceId = null, int page = 1, int pageSize = 50)
    {
        try
        {
            var query = _context.AnalyticsEvents.AsQueryable();

            if (experienceId.HasValue)
            {
                query = query.Where(ae => ae.ExperienceId == experienceId.Value);
            }

            var events = await query
                .OrderByDescending(ae => ae.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(ae => new AnalyticsEventDto(
                    ae.Id,
                    ae.EventType,
                    ae.ExperienceId,
                    ae.UserAgent,
                    ae.IpAddress,
                    ae.Referrer,
                    ae.AdditionalData,
                    ae.CreatedAt
                ))
                .ToListAsync();

            return ApiResponse<IEnumerable<AnalyticsEventDto>>.SuccessResult(events);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting analytics events");
            return ApiResponse<IEnumerable<AnalyticsEventDto>>.ErrorResult("Error retrieving events");
        }
    }

    public async Task<ApiResponse<Dictionary<string, int>>> GetEventStatsByExperienceAsync(Guid experienceId)
    {
        try
        {
            var stats = await _context.AnalyticsEvents
                .Where(ae => ae.ExperienceId == experienceId)
                .GroupBy(ae => ae.EventType)
                .Select(g => new { EventType = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.EventType, x => x.Count);

            return ApiResponse<Dictionary<string, int>>.SuccessResult(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting event stats for experience: {ExperienceId}", experienceId);
            return ApiResponse<Dictionary<string, int>>.ErrorResult("Error retrieving event statistics");
        }
    }

    public async Task<ApiResponse<AnalyticsSummaryDto>> GetAnalyticsSummaryAsync()
    {
        try
        {
            var totalEvents = await _context.AnalyticsEvents.CountAsync();
            var totalViews = await _context.AnalyticsEvents.CountAsync(e => e.EventType.ToLower() == "view");
            var uniqueIps = await _context.AnalyticsEvents
                .Where(e => !string.IsNullOrEmpty(e.IpAddress))
                .Select(e => e.IpAddress)
                .Distinct()
                .CountAsync();

            var totalExperiences = await _context.Experiences.CountAsync();
            var lastEventDate = await _context.AnalyticsEvents.MaxAsync(e => (DateTime?)e.CreatedAt);

            var eventTypeBreakdown = await _context.AnalyticsEvents
                .GroupBy(e => e.EventType)
                .Select(g => new { EventType = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.EventType, x => x.Count);

            // Calcular tiempo promedio (simulado - en segundos)
            var averageTimeSpent = 154.0; // 2m 34s como en el mock

            // Calcular tasa de conversión (interacciones / views)
            var totalInteractions = await _context.AnalyticsEvents
                .CountAsync(e => e.EventType.ToLower() == "interaction");
            var conversionRate = totalViews > 0 ? (double)totalInteractions / totalViews * 100 : 0;

            var summary = new AnalyticsSummaryDto(
                TotalEvents: totalEvents,
                TotalViews: totalViews,
                UniqueUsers: uniqueIps,
                TotalExperiences: totalExperiences,
                AverageTimeSpent: averageTimeSpent,
                ConversionRate: Math.Round(conversionRate, 2),
                LastEventDate: lastEventDate,
                EventTypeBreakdown: eventTypeBreakdown
            );

            return ApiResponse<AnalyticsSummaryDto>.SuccessResult(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating analytics summary");
            return ApiResponse<AnalyticsSummaryDto>.ErrorResult("Error generating summary");
        }
    }

    public async Task<ApiResponse<IEnumerable<DeviceStatsDto>>> GetDeviceStatsAsync()
    {
        try
        {
            var allEvents = await _context.AnalyticsEvents
                .Where(e => !string.IsNullOrEmpty(e.UserAgent))
                .ToListAsync();

            var deviceStats = allEvents
                .GroupBy(e => DetectDeviceType(e.UserAgent))
                .Select(g => new { Device = g.Key, Count = g.Count() })
                .ToList();

            var totalCount = deviceStats.Sum(d => d.Count);

            var result = deviceStats.Select(d => new DeviceStatsDto(
                DeviceName: d.Device,
                Count: d.Count,
                Percentage: totalCount > 0 ? Math.Round((double)d.Count / totalCount * 100, 2) : 0
            )).ToList();

            return ApiResponse<IEnumerable<DeviceStatsDto>>.SuccessResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device stats");
            return ApiResponse<IEnumerable<DeviceStatsDto>>.ErrorResult("Error retrieving device statistics");
        }
    }

    public async Task<ApiResponse<IEnumerable<TimeSeriesDataDto>>> GetTimeSeriesDataAsync(int days = 30)
    {
        try
        {
            var startDate = DateTime.UtcNow.AddDays(-days);

            var events = await _context.AnalyticsEvents
                .Where(e => e.CreatedAt >= startDate)
                .ToListAsync();

            var timeSeriesData = events
                .GroupBy(e => e.CreatedAt.Date)
                .Select(g => new TimeSeriesDataDto(
                    Period: g.Key.ToString("MMM dd"),
                    Views: g.Count(e => e.EventType.ToLower() == "view"),
                    Interactions: g.Count(e => e.EventType.ToLower() == "interaction")
                ))
                .OrderBy(t => t.Period)
                .ToList();

            return ApiResponse<IEnumerable<TimeSeriesDataDto>>.SuccessResult(timeSeriesData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting time series data for {Days} days", days);
            return ApiResponse<IEnumerable<TimeSeriesDataDto>>.ErrorResult("Error retrieving time series data");
        }
    }

    public async Task<ApiResponse<IEnumerable<ExperienceStatsDto>>> GetTopExperiencesAsync(int limit = 10)
    {
        try
        {
            var experienceStats = await _context.AnalyticsEvents
                .GroupBy(e => e.ExperienceId)
                .Select(g => new
                {
                    ExperienceId = g.Key,
                    ViewCount = g.Count(e => e.EventType.ToLower() == "view"),
                    InteractionCount = g.Count(e => e.EventType.ToLower() == "interaction"),
                    LastViewed = g.Max(e => (DateTime?)e.CreatedAt)
                })
                .OrderByDescending(s => s.ViewCount)
                .Take(limit)
                .ToListAsync();

            var experienceIds = experienceStats.Select(s => s.ExperienceId).ToList();
            var experiences = await _context.Experiences
                .Where(e => experienceIds.Contains(e.Id))
                .ToDictionaryAsync(e => e.Id, e => e.Title);

            var result = experienceStats.Select(s => new ExperienceStatsDto(
                ExperienceId: s.ExperienceId,
                ExperienceName: experiences.ContainsKey(s.ExperienceId) ? experiences[s.ExperienceId] : "Unknown",
                ViewCount: s.ViewCount,
                InteractionCount: s.InteractionCount,
                LastViewed: s.LastViewed
            )).ToList();

            return ApiResponse<IEnumerable<ExperienceStatsDto>>.SuccessResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top experiences");
            return ApiResponse<IEnumerable<ExperienceStatsDto>>.ErrorResult("Error retrieving top experiences");
        }
    }

    private string DetectDeviceType(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
            return "Unknown";

        userAgent = userAgent.ToLower();

        if (userAgent.Contains("mobile") || userAgent.Contains("android") || userAgent.Contains("iphone"))
            return "Mobile";

        if (userAgent.Contains("tablet") || userAgent.Contains("ipad"))
            return "Tablet";

        return "Desktop";
    }
}