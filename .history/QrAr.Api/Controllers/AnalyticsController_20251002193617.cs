using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

public static class AnalyticsController
{

    // Minimal API Extension Methods
    public static void MapAnalyticsEndpoints(IEndpointRouteBuilder app)
    {
        var analyticsGroup = app.MapGroup("/api/analytics")
            .WithTags("Analytics");

        analyticsGroup.MapPost("track", async (AnalyticsEventCreateDto dto, IAnalyticsService service) =>
        {
            var result = await service.TrackEventAsync(dto);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Track analytics event");

        analyticsGroup.MapGet("events", async (Guid? experienceId, int page, int pageSize, IAnalyticsService service) =>
        {
            var result = await service.GetEventsAsync(experienceId, page, pageSize);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Get analytics events");

        analyticsGroup.MapGet("stats/{experienceId:guid}", async (Guid experienceId, IAnalyticsService service) =>
        {
            var result = await service.GetEventStatsByExperienceAsync(experienceId);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Get event statistics for experience");
    }
}