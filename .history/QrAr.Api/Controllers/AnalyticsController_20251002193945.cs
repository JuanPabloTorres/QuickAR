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
            .Produces<ApiResponse<object>>(200);
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
            // Este sería un método nuevo en el servicio para obtener un resumen general
            var allEvents = await service.GetEventsAsync(null, 1, 1000);
            
            if (!allEvents.Success)
            {
                return HandleServiceResponse(allEvents);
            }

            var summary = new
            {
                TotalEvents = allEvents.Data?.Count() ?? 0,
                LastEventDate = allEvents.Data?.Max(e => e.CreatedAt),
                EventTypes = allEvents.Data?.GroupBy(e => e.EventType)
                    .Select(g => new { EventType = g.Key, Count = g.Count() })
                    .ToArray() ?? Array.Empty<object>()
            };

            var response = ApiResponse<object>.SuccessResult(summary);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error generating summary: {ex.Message}", statusCode: 500);
        }
    }
}