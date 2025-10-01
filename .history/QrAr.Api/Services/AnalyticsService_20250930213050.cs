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
}