using Microsoft.AspNetCore.Mvc;
using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileUploadController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;
    private readonly ILogger<FileUploadController> _logger;

    public FileUploadController(IFileUploadService fileUploadService, ILogger<FileUploadController> logger)
    {
        _fileUploadService = fileUploadService;
        _logger = logger;
    }

    [HttpPost("{category}")]
    public async Task<ActionResult<ApiResponse<FileUploadResult>>> UploadFile(string category, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<FileUploadResult>.ErrorResult("No file provided"));
        }

        if (!IsValidCategory(category))
        {
            return BadRequest(ApiResponse<FileUploadResult>.ErrorResult("Invalid category. Allowed: models, images, videos"));
        }

        var result = await _fileUploadService.UploadFileAsync(file, category);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return StatusCode(500, result);
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteFile([FromQuery] string fileName, [FromQuery] string category = "uploads")
    {
        if (string.IsNullOrEmpty(fileName))
        {
            return BadRequest(ApiResponse<bool>.ErrorResult("File name is required"));
        }

        var result = await _fileUploadService.DeleteFileAsync(fileName, category);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return StatusCode(500, result);
    }

    private static bool IsValidCategory(string category)
    {
        return category.ToLower() is "models" or "images" or "videos";
    }

    // Minimal API Extension Methods
    public static void MapFileUploadEndpoints(IEndpointRouteBuilder app)
    {
        var uploadGroup = app.MapGroup("/api/upload")
            .WithTags("File Upload");

        uploadGroup.MapPost("{category}", async (string category, IFormFile file, IFileUploadService service) =>
        {
            var validCategories = new[] { "models", "images", "videos" };
            if (!validCategories.Contains(category))
            {
                return Results.BadRequest(ApiResponse<FileUploadResult>.ErrorResult("Invalid category"));
            }

            var result = await service.UploadFileAsync(file, category);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Upload file")
        .DisableAntiforgery();

        uploadGroup.MapDelete("{category}/{fileName}", async (string category, string fileName, IFileUploadService service) =>
        {
            var result = await service.DeleteFileAsync(fileName, category);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithSummary("Delete file");
    }
}