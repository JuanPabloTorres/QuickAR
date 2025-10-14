using QrAr.Api.Controllers.Base;
using QrAr.Api.Extensions;
using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

/// <summary>
/// Grupo de endpoints para analytics y métricas
/// </summary>
public class AnalyticsEndpointGroup : BaseEndpointGroup
{
    public override string RoutePrefix => "analytics";
    public override string Tag => "Analytics";

    public override void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = CreateGroup(app);
        var legacyGroup = CreateLegacyGroup(app);

        // POST /api/v1/analytics/track
        group.MapPost("track", TrackEvent)
            .WithSummary("Rastrear evento de analytics")
            .WithDescription("Registra un nuevo evento de analytics para una experiencia")
            .WithEndpointLogging("TrackEvent")
            .WithModelValidation<AnalyticsEventCreateDto>()
            .Produces<ApiResponse<AnalyticsEventDto>>(200)
            .Produces<ApiResponse<object>>(400);

        // GET /api/v1/analytics/events
        group.MapGet("events", GetEvents)
            .WithSummary("Obtener eventos de analytics")
            .WithDescription("Recupera eventos de analytics con paginación y filtros opcionales")
            .WithEndpointLogging("GetEvents")
            .Produces<ApiResponse<IEnumerable<AnalyticsEventDto>>>(200)
            .Produces<ApiResponse<object>>(400);

        // GET /api/v1/analytics/stats/{experienceId}
        group.MapGet("stats/{experienceId:guid}", GetEventStatsByExperience)
            .WithSummary("Obtener estadísticas por experiencia")
            .WithDescription("Recupera estadísticas de eventos para una experiencia específica")
            .WithEndpointLogging("GetEventStatsByExperience")
            .Produces<ApiResponse<object>>(200)
            .Produces<ApiResponse<object>>(404);

        // GET /api/v1/analytics/summary
        group.MapGet("summary", GetAnalyticsSummary)
            .WithSummary("Obtener resumen de analytics")
            .WithDescription("Obtiene un resumen general de analytics del sistema")
            .WithEndpointLogging("GetAnalyticsSummary")
            .Produces<ApiResponse<AnalyticsSummaryDto>>(200);

        // GET /api/v1/analytics/devices
        group.MapGet("devices", GetDeviceStats)
            .WithSummary("Obtener estadísticas por dispositivo")
            .WithDescription("Obtiene la distribución de eventos por tipo de dispositivo")
            .WithEndpointLogging("GetDeviceStats")
            .Produces<ApiResponse<IEnumerable<DeviceStatsDto>>>(200);

        // GET /api/v1/analytics/timeseries
        group.MapGet("timeseries", GetTimeSeriesData)
            .WithSummary("Obtener datos de serie temporal")
            .WithDescription("Obtiene datos de eventos agrupados por período de tiempo")
            .WithEndpointLogging("GetTimeSeriesData")
            .Produces<ApiResponse<IEnumerable<TimeSeriesDataDto>>>(200);

        // GET /api/v1/analytics/top-experiences
        group.MapGet("top-experiences", GetTopExperiences)
            .WithSummary("Obtener experiencias más vistas")
            .WithDescription("Obtiene las experiencias con más visualizaciones")
            .WithEndpointLogging("GetTopExperiences")
            .Produces<ApiResponse<IEnumerable<ExperienceStatsDto>>>(200);

        // === ENDPOINTS LEGACY ===

        // POST /api/analytics/track
        legacyGroup.MapPost("track", TrackEvent)
            .WithSummary("Rastrear evento de analytics (Legacy)")
            .WithDescription("Registra un nuevo evento de analytics para una experiencia")
            .WithEndpointLogging("TrackEvent_Legacy")
            .WithModelValidation<AnalyticsEventCreateDto>()
            .Produces<ApiResponse<AnalyticsEventDto>>(200)
            .Produces<ApiResponse<object>>(400);

        // GET /api/analytics/events
        legacyGroup.MapGet("events", GetEvents)
            .WithSummary("Obtener eventos de analytics (Legacy)")
            .WithDescription("Recupera eventos de analytics con paginación y filtros opcionales")
            .WithEndpointLogging("GetEvents_Legacy")
            .Produces<ApiResponse<IEnumerable<AnalyticsEventDto>>>(200)
            .Produces<ApiResponse<object>>(400);

        // GET /api/analytics/stats/{experienceId}
        legacyGroup.MapGet("stats/{experienceId:guid}", GetEventStatsByExperience)
            .WithSummary("Obtener estadísticas por experiencia (Legacy)")
            .WithDescription("Recupera estadísticas de eventos para una experiencia específica")
            .WithEndpointLogging("GetEventStatsByExperience_Legacy")
            .Produces<ApiResponse<object>>(200)
            .Produces<ApiResponse<object>>(404);

        // GET /api/analytics/summary
        legacyGroup.MapGet("summary", GetAnalyticsSummary)
            .WithSummary("Obtener resumen de analytics (Legacy)")
            .WithDescription("Obtiene un resumen general de analytics del sistema")
            .WithEndpointLogging("GetAnalyticsSummary_Legacy")
            .Produces<ApiResponse<AnalyticsSummaryDto>>(200);
    }

    private static async Task<IResult> TrackEvent(AnalyticsEventCreateDto dto, IAnalyticsService service)
    {
        return await ValidateAndExecute(
            dto,
            async input => await service.TrackEventAsync(input)
        );
    }

    private static async Task<IResult> GetEvents(
        Guid? experienceId,
        int page = 1,
        int pageSize = 20,
        IAnalyticsService service = null!)
    {
        // Validar parámetros de paginación
        if (page < 1)
        {
            return Results.BadRequest(ApiResponse<object>.ErrorResult("Page must be greater than 0"));
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return Results.BadRequest(ApiResponse<object>.ErrorResult("Page size must be between 1 and 100"));
        }

        try
        {
            var result = await service.GetEventsAsync(experienceId, page, pageSize);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving events: {ex.Message}", statusCode: 500);
        }
    }

    private static async Task<IResult> GetEventStatsByExperience(Guid experienceId, IAnalyticsService service)
    {
        if (experienceId == Guid.Empty)
        {
            return Results.BadRequest(ApiResponse<object>.ErrorResult("Invalid experience ID"));
        }

        try
        {
            var result = await service.GetEventStatsByExperienceAsync(experienceId);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving stats: {ex.Message}", statusCode: 500);
        }
    }

    private static async Task<IResult> GetAnalyticsSummary(IAnalyticsService service)
    {
        try
        {
            var result = await service.GetAnalyticsSummaryAsync();
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error generating summary: {ex.Message}", statusCode: 500);
        }
    }

    private static async Task<IResult> GetDeviceStats(IAnalyticsService service)
    {
        try
        {
            var result = await service.GetDeviceStatsAsync();
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving device stats: {ex.Message}", statusCode: 500);
        }
    }

    private static async Task<IResult> GetTimeSeriesData(int days = 30, IAnalyticsService service = null!)
    {
        if (days < 1 || days > 365)
        {
            return Results.BadRequest(ApiResponse<object>.ErrorResult("Days must be between 1 and 365"));
        }

        try
        {
            var result = await service.GetTimeSeriesDataAsync(days);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving time series data: {ex.Message}", statusCode: 500);
        }
    }

    private static async Task<IResult> GetTopExperiences(int limit = 10, IAnalyticsService service = null!)
    {
        if (limit < 1 || limit > 100)
        {
            return Results.BadRequest(ApiResponse<object>.ErrorResult("Limit must be between 1 and 100"));
        }

        try
        {
            var result = await service.GetTopExperiencesAsync(limit);
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving top experiences: {ex.Message}", statusCode: 500);
        }
    }
}