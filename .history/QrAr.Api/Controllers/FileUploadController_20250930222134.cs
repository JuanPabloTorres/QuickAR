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
}