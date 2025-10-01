using Microsoft.AspNetCore.Mvc;
using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    [HttpPost("track")]
    public async Task<ActionResult<ApiResponse<AnalyticsEventDto>>> TrackEvent([FromBody] AnalyticsEventCreateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<AnalyticsEventDto>.ErrorResult("Invalid data",
                ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToArray()));
        }

        var result = await _analyticsService.TrackEventAsync(createDto);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return StatusCode(500, result);
    }

    [HttpGet("experiences/{experienceId:guid}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AnalyticsEventDto>>>> GetExperienceAnalytics(Guid experienceId)
    {
        var result = await _analyticsService.GetEventsAsync(experienceId);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return StatusCode(500, result);
    }
}