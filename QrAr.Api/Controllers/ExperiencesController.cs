using Microsoft.AspNetCore.Mvc;
using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExperiencesController : ControllerBase
{
    private readonly IExperienceService _experienceService;
    private readonly ILogger<ExperiencesController> _logger;

    public ExperiencesController(IExperienceService experienceService, ILogger<ExperiencesController> logger)
    {
        _experienceService = experienceService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ExperienceDto>>>> GetExperiences()
    {
        var result = await _experienceService.GetAllAsync();
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return StatusCode(500, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ExperienceDto?>>> GetExperience(Guid id)
    {
        var result = await _experienceService.GetByIdAsync(id);
        
        if (result.Success && result.Data != null)
        {
            return Ok(result);
        }
        
        if (result.Success && result.Data == null)
        {
            return NotFound(ApiResponse<ExperienceDto?>.ErrorResult("Experience not found"));
        }
        
        return StatusCode(500, result);
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<ExperienceDto?>>> GetExperienceBySlug(string slug)
    {
        var result = await _experienceService.GetBySlugAsync(slug);
        
        if (result.Success && result.Data != null)
        {
            return Ok(result);
        }
        
        if (result.Success && result.Data == null)
        {
            return NotFound(ApiResponse<ExperienceDto?>.ErrorResult("Experience not found"));
        }
        
        return StatusCode(500, result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExperienceDto>>> CreateExperience([FromBody] ExperienceCreateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<ExperienceDto>.ErrorResult("Invalid data", 
                ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToArray()));
        }

        var result = await _experienceService.CreateAsync(createDto);
        
        if (result.Success)
        {
            return CreatedAtAction(nameof(GetExperience), new { id = result.Data!.Id }, result);
        }
        
        return StatusCode(500, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ExperienceDto>>> UpdateExperience(Guid id, [FromBody] ExperienceUpdateDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<ExperienceDto>.ErrorResult("Invalid data",
                ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToArray()));
        }

        var result = await _experienceService.UpdateAsync(id, updateDto);
        
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
}