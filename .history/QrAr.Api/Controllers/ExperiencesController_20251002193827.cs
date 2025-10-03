using QrAr.Api.Controllers.Base;
using QrAr.Api.Extensions;
using QrAr.Api.Services;
using QrAr.Api.DTOs;

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
        var group = CreateGroup(app);

        // GET /api/v1/experiences
        group.MapGet("", GetAllExperiences)
            .WithSummary("Obtener todas las experiencias")
            .WithDescription("Recupera una lista de todas las experiencias de AR disponibles")
            .WithEndpointLogging("GetAllExperiences")
            .Produces<ApiResponse<IEnumerable<ExperienceDto>>>(200)
            .Produces<ApiResponse<object>>(400);

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
            .WithSummary("Crear nueva experiencia")
            .WithDescription("Crea una nueva experiencia de AR")
            .WithEndpointLogging("CreateExperience")
            .WithModelValidation<ExperienceCreateDto>()
            .Produces<ApiResponse<ExperienceDto>>(201)
            .Produces<ApiResponse<object>>(400);

        // PUT /api/v1/experiences/{id}
        group.MapPut("{id:guid}", UpdateExperience)
            .WithSummary("Actualizar experiencia")
            .WithDescription("Actualiza una experiencia existente")
            .WithEndpointLogging("UpdateExperience")
            .WithModelValidation<ExperienceUpdateDto>()
            .Produces<ApiResponse<ExperienceDto>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(404);

        // DELETE /api/v1/experiences/{id}
        group.MapDelete("{id:guid}", DeleteExperience)
            .WithSummary("Eliminar experiencia")
            .WithDescription("Elimina permanentemente una experiencia")
            .WithEndpointLogging("DeleteExperience")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(404);

        // PATCH /api/v1/experiences/{id}/toggle-active
        group.MapPatch("{id:guid}/toggle-active", ToggleExperienceActive)
            .WithSummary("Alternar estado activo")
            .WithDescription("Cambia el estado activo/inactivo de una experiencia")
            .WithEndpointLogging("ToggleExperienceActive")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(404);
    }

    private static async Task<IResult> GetAllExperiences(IExperienceService service)
    {
        var result = await service.GetAllAsync();
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

    private static async Task<IResult> CreateExperience(ExperienceCreateDto dto, IExperienceService service)
    {
        return await ValidateAndExecute(
            dto,
            async input => await service.CreateAsync(input),
            $"/api/v1/experiences/{{id}}"
        );
    }

    private static async Task<IResult> UpdateExperience(Guid id, ExperienceUpdateDto dto, IExperienceService service)
    {
        return await ValidateAndExecute(
            dto,
            async input => await service.UpdateAsync(id, input)
        );
    }

    private static async Task<IResult> DeleteExperience(Guid id, IExperienceService service)
    {
        var result = await service.DeleteAsync(id);
        return HandleServiceResponse(result);
    }

    private static async Task<IResult> ToggleExperienceActive(Guid id, IExperienceService service)
    {
        var result = await service.ToggleActiveAsync(id);
        return HandleServiceResponse(result);
    }
}