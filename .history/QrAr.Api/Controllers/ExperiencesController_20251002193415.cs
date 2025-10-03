using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

public static class ExperiencesController
{
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        if (result.Message == "Experience not found")
        {
            return NotFound(result);
        }
        
        return StatusCode(500, result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteExperience(Guid id)
    {
        var result = await _experienceService.DeleteAsync(id);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        if (result.Message == "Experience not found")
        {
            return NotFound(result);
        }
        
        return StatusCode(500, result);
    }

    [HttpPatch("{id:guid}/toggle-active")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleExperienceActive(Guid id)
    {
        var result = await _experienceService.ToggleActiveAsync(id);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        if (result.Message == "Experience not found")
        {
            return NotFound(result);
        }
        
        return StatusCode(500, result);
    }

    // Minimal API Extension Methods
    public static void MapExperienceEndpoints(IEndpointRouteBuilder app)
    {
        var experienceGroup = app.MapGroup("/api/experiences")
            .WithTags("Experiences");

        experienceGroup.MapGet("", async (IExperienceService service) =>
        {
            var result = await service.GetAllAsync();
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Get all experiences");

        experienceGroup.MapGet("{id:guid}", async (Guid id, IExperienceService service) =>
        {
            var result = await service.GetByIdAsync(id);
            return result.Success ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithSummary("Get experience by ID");

        experienceGroup.MapGet("slug/{slug}", async (string slug, IExperienceService service) =>
        {
            var result = await service.GetBySlugAsync(slug);
            return result.Success ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithSummary("Get experience by slug");

        experienceGroup.MapPost("", async (ExperienceCreateDto dto, IExperienceService service) =>
        {
            var result = await service.CreateAsync(dto);
            return result.Success ? Results.Created($"/api/experiences/{result.Data!.Id}", result) : Results.BadRequest(result);
        })
        .WithSummary("Create new experience");

        experienceGroup.MapPut("{id:guid}", async (Guid id, ExperienceUpdateDto dto, IExperienceService service) =>
        {
            var result = await service.UpdateAsync(id, dto);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Update experience");

        experienceGroup.MapDelete("{id:guid}", async (Guid id, IExperienceService service) =>
        {
            var result = await service.DeleteAsync(id);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Delete experience");

        experienceGroup.MapPatch("{id:guid}/toggle-active", async (Guid id, IExperienceService service) =>
        {
            var result = await service.ToggleActiveAsync(id);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Toggle experience active status");
    }


}