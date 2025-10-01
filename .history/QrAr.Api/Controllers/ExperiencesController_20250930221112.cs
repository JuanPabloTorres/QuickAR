using Microsoft.AspNetCore.Mvc;
using QrAr.Api.Services;
using QrAr.Api.DTOs;
using QrAr.Api.Models;

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
    public async Task<ActionResult<ApiResponse<List<ExperienceDto>>>> GetExperiences()
    {
        try
        {
            var experiences = await _experienceService.GetAllExperiencesAsync();
            return Ok(new ApiResponse<List<ExperienceDto>>
            {
                Success = true,
                Data = experiences
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting experiences");
            return StatusCode(500, new ApiResponse<List<ExperienceDto>>
            {
                Success = false,
                Message = "Error retrieving experiences",
                Errors = [ex.Message]
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ExperienceDto>>> GetExperience(string id)
    {
        try
        {
            var experience = await _experienceService.GetExperienceByIdAsync(id);
            if (experience == null)
            {
                return NotFound(new ApiResponse<ExperienceDto>
                {
                    Success = false,
                    Message = "Experience not found"
                });
            }

            return Ok(new ApiResponse<ExperienceDto>
            {
                Success = true,
                Data = experience
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting experience {Id}", id);
            return StatusCode(500, new ApiResponse<ExperienceDto>
            {
                Success = false,
                Message = "Error retrieving experience",
                Errors = [ex.Message]
            });
        }
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<ExperienceDto>>> GetExperienceBySlug(string slug)
    {
        try
        {
            var experience = await _experienceService.GetExperienceBySlugAsync(slug);
            if (experience == null)
            {
                return NotFound(new ApiResponse<ExperienceDto>
                {
                    Success = false,
                    Message = "Experience not found"
                });
            }

            return Ok(new ApiResponse<ExperienceDto>
            {
                Success = true,
                Data = experience
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting experience by slug {Slug}", slug);
            return StatusCode(500, new ApiResponse<ExperienceDto>
            {
                Success = false,
                Message = "Error retrieving experience",
                Errors = [ex.Message]
            });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExperienceDto>>> CreateExperience([FromBody] ExperienceCreateDto createDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<ExperienceDto>
                {
                    Success = false,
                    Message = "Invalid data",
                    Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                });
            }

            var experience = await _experienceService.CreateExperienceAsync(createDto);
            return CreatedAtAction(nameof(GetExperience), new { id = experience.Id }, new ApiResponse<ExperienceDto>
            {
                Success = true,
                Data = experience
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating experience");
            return StatusCode(500, new ApiResponse<ExperienceDto>
            {
                Success = false,
                Message = "Error creating experience",
                Errors = [ex.Message]
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ExperienceDto>>> UpdateExperience(string id, [FromBody] ExperienceUpdateDto updateDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<ExperienceDto>
                {
                    Success = false,
                    Message = "Invalid data",
                    Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                });
            }

            var experience = await _experienceService.UpdateExperienceAsync(id, updateDto);
            if (experience == null)
            {
                return NotFound(new ApiResponse<ExperienceDto>
                {
                    Success = false,
                    Message = "Experience not found"
                });
            }

            return Ok(new ApiResponse<ExperienceDto>
            {
                Success = true,
                Data = experience
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating experience {Id}", id);
            return StatusCode(500, new ApiResponse<ExperienceDto>
            {
                Success = false,
                Message = "Error updating experience",
                Errors = [ex.Message]
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteExperience(string id)
    {
        try
        {
            var result = await _experienceService.DeleteExperienceAsync(id);
            if (!result)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Experience not found"
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting experience {Id}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Error deleting experience",
                Errors = [ex.Message]
            });
        }
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleExperienceActive(string id)
    {
        try
        {
            var result = await _experienceService.ToggleExperienceActiveAsync(id);
            if (!result)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Experience not found"
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling experience active state {Id}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Error updating experience",
                Errors = [ex.Message]
            });
        }
    }
}