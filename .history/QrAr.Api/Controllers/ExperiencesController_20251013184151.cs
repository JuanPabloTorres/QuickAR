using QrAr.Api.Controllers.Base;
using QrAr.Api.Extensions;
using QrAr.Api.Services;
using QrAr.Api.DTOs;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace QrAr.Api.Controllers;

/// <summary>
/// Grupo de endpoints para manejo de experiencias de AR
/// </summary>
public class ExperiencesEndpointGroup : BaseEndpointGroup
{
    public override string RoutePrefix => "experiences";
    public override string Tag => "Experiences";

    public override void MapEndpoints(IEndpointRouteBuilder app)
    {
        // Grupo versionado (v1)
        var group = CreateGroup(app);
        // Grupo legacy para compatibilidad hacia atrás
        var legacyGroup = CreateLegacyGroup(app);

        // GET /api/v1/experiences y /api/experiences
        group.MapGet("", GetAllExperiences)
            .RequireAuthorization()
            .WithSummary("Obtener todas las experiencias")
            .WithDescription("Recupera una lista de todas las experiencias de AR del usuario autenticado")
            .WithEndpointLogging("GetAllExperiences")
            .Produces<ApiResponse<IEnumerable<ExperienceDto>>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(401);

        legacyGroup.MapGet("", GetAllExperiences)
            .RequireAuthorization()
            .WithSummary("Obtener todas las experiencias (Legacy)")
            .WithDescription("Recupera una lista de todas las experiencias de AR del usuario autenticado")
            .WithEndpointLogging("GetAllExperiences_Legacy")
            .Produces<ApiResponse<IEnumerable<ExperienceDto>>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(401);

        // GET /api/experiences/{id}
        legacyGroup.MapGet("{id:guid}", GetExperienceById)
            .WithSummary("Obtener experiencia por ID (Legacy)")
            .WithDescription("Recupera una experiencia específica por su identificador único")
            .WithEndpointLogging("GetExperienceById_Legacy")
            .Produces<ApiResponse<ExperienceDto>>(200)
            .Produces<ApiResponse<object>>(404);

        // GET /api/experiences/slug/{slug}
        legacyGroup.MapGet("slug/{slug}", GetExperienceBySlug)
            .WithSummary("Obtener experiencia por slug (Legacy)")
            .WithDescription("Recupera una experiencia por su slug único")
            .WithEndpointLogging("GetExperienceBySlug_Legacy")
            .Produces<ApiResponse<ExperienceDto>>(200)
            .Produces<ApiResponse<object>>(404);

        // POST /api/experiences
        legacyGroup.MapPost("", CreateExperience)
            .RequireAuthorization()
            .WithSummary("Crear nueva experiencia (Legacy)")
            .WithDescription("Crea una nueva experiencia de AR")
            .WithEndpointLogging("CreateExperience_Legacy")
            .WithModelValidation<ExperienceCreateDto>()
            .Produces<ApiResponse<ExperienceDto>>(201)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(401);

        // PUT /api/experiences/{id}
        legacyGroup.MapPut("{id:guid}", UpdateExperience)
            .RequireAuthorization()
            .WithSummary("Actualizar experiencia (Legacy)")
            .WithDescription("Actualiza una experiencia existente")
            .WithEndpointLogging("UpdateExperience_Legacy")
            .WithModelValidation<ExperienceUpdateDto>()
            .Produces<ApiResponse<ExperienceDto>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(404)
            .Produces<ApiResponse<object>>(401);

        // DELETE /api/experiences/{id}
        legacyGroup.MapDelete("{id:guid}", DeleteExperience)
            .RequireAuthorization()
            .WithSummary("Eliminar experiencia (Legacy)")
            .WithDescription("Elimina permanentemente una experiencia")
            .WithEndpointLogging("DeleteExperience_Legacy")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(404)
            .Produces<ApiResponse<object>>(401);

        // PATCH /api/experiences/{id}/toggle-active
        legacyGroup.MapPatch("{id:guid}/toggle-active", ToggleExperienceActive)
            .RequireAuthorization()
            .WithSummary("Alternar estado activo (Legacy)")
            .WithDescription("Cambia el estado activo/inactivo de una experiencia")
            .WithEndpointLogging("ToggleExperienceActive_Legacy")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(404)
            .Produces<ApiResponse<object>>(401);

        // GET /api/v1/experiences/{id}
        group.MapGet("{id:guid}", GetExperienceById)
            .WithSummary("Obtener experiencia por ID")
            .WithDescription("Recupera una experiencia específica por su identificador único")
            .WithEndpointLogging("GetExperienceById")
            .Produces<ApiResponse<ExperienceDto>>(200)
            .Produces<ApiResponse<object>>(404);

        // GET /api/v1/experiences/slug/{slug}
        group.MapGet("slug/{slug}", GetExperienceBySlug)
            .WithSummary("Obtener experiencia por slug")
            .WithDescription("Recupera una experiencia por su slug único")
            .WithEndpointLogging("GetExperienceBySlug")
            .Produces<ApiResponse<ExperienceDto>>(200)
            .Produces<ApiResponse<object>>(404);

        // POST /api/v1/experiences
        group.MapPost("", CreateExperience)
            .RequireAuthorization()
            .WithSummary("Crear nueva experiencia")
            .WithDescription("Crea una nueva experiencia de AR")
            .WithEndpointLogging("CreateExperience")
            .WithModelValidation<ExperienceCreateDto>()
            .Produces<ApiResponse<ExperienceDto>>(201)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(401);

        // PUT /api/v1/experiences/{id}
        group.MapPut("{id:guid}", UpdateExperience)
            .RequireAuthorization()
            .WithSummary("Actualizar experiencia")
            .WithDescription("Actualiza una experiencia existente")
            .WithEndpointLogging("UpdateExperience")
            .WithModelValidation<ExperienceUpdateDto>()
            .Produces<ApiResponse<ExperienceDto>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(404)
            .Produces<ApiResponse<object>>(401);

        // DELETE /api/v1/experiences/{id}
        group.MapDelete("{id:guid}", DeleteExperience)
            .RequireAuthorization()
            .WithSummary("Eliminar experiencia")
            .WithDescription("Elimina permanentemente una experiencia")
            .WithEndpointLogging("DeleteExperience")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(404)
            .Produces<ApiResponse<object>>(401);

        // PATCH /api/v1/experiences/{id}/toggle-active
        group.MapPatch("{id:guid}/toggle-active", ToggleExperienceActive)
            .RequireAuthorization()
            .WithSummary("Alternar estado activo")
            .WithDescription("Cambia el estado activo/inactivo de una experiencia")
            .WithEndpointLogging("ToggleExperienceActive")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(404)
            .Produces<ApiResponse<object>>(401);
    }

    private static async Task<IResult> GetAllExperiences(HttpContext httpContext, IExperienceService service)
    {
        // Extract userId from JWT claims
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Json(
                ApiResponse<object>.ErrorResult("Invalid or missing user ID in token"),
                statusCode: 401
            );
        }

        var result = await service.GetAllByUserIdAsync(userId);
        return HandleServiceResponse(result);
    }

    private static async Task<IResult> GetExperienceById(Guid id, IExperienceService service)
    {
        var result = await service.GetByIdAsync(id);
        return HandleServiceResponse(result);
    }

    private static async Task<IResult> GetExperienceBySlug(string slug, IExperienceService service)
    {
        var result = await service.GetBySlugAsync(slug);
        return HandleServiceResponse(result);
    }

    private static async Task<IResult> CreateExperience(HttpContext httpContext, ExperienceCreateDto dto, IExperienceService service)
    {
        // Extract userId from JWT claims
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Json(
                ApiResponse<object>.ErrorResult("Invalid or missing user ID in token"),
                statusCode: 401
            );
        }

        return await ValidateAndExecute(
            dto,
            async input => await service.CreateAsync(input, userId),
            $"/api/v1/experiences/{{id}}"
        );
    }

    private static async Task<IResult> UpdateExperience(HttpContext httpContext, Guid id, ExperienceUpdateDto dto, IExperienceService service)
    {
        // Extract userId from JWT claims
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Json(
                ApiResponse<object>.ErrorResult("Invalid or missing user ID in token"),
                statusCode: 401
            );
        }

        return await ValidateAndExecute(
            dto,
            async input => await service.UpdateAsync(id, input, userId)
        );
    }

    private static async Task<IResult> DeleteExperience(HttpContext httpContext, Guid id, IExperienceService service)
    {
        // Extract userId from JWT claims
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Json(
                ApiResponse<object>.ErrorResult("Invalid or missing user ID in token"),
                statusCode: 401
            );
        }

        var result = await service.DeleteAsync(id, userId);
        return HandleServiceResponse(result);
    }

    private static async Task<IResult> ToggleExperienceActive(HttpContext httpContext, Guid id, IExperienceService service)
    {
        // Extract userId from JWT claims
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Json(
                ApiResponse<object>.ErrorResult("Invalid or missing user ID in token"),
                statusCode: 401
            );
        }

        var result = await service.ToggleActiveAsync(id, userId);
        return HandleServiceResponse(result);
    }
}