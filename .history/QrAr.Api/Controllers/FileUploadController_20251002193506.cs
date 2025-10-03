using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

public static class FileUploadController
{

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