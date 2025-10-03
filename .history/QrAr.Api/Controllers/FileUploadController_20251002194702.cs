using QrAr.Api.Controllers.Base;
using QrAr.Api.Extensions;
using QrAr.Api.Services;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

/// <summary>
/// Grupo de endpoints para manejo de carga de archivos
/// </summary>
public class FileUploadEndpointGroup : BaseEndpointGroup
{
    public override string RoutePrefix => "upload";
    public override string Tag => "File Upload";

    private static readonly string[] ValidCategories = { "models", "images", "videos" };

    public override void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = CreateGroup(app);
        var legacyGroup = CreateLegacyGroup(app);

        // POST /api/v1/upload/{category}
        group.MapPost("{category}", UploadFile)
            .WithSummary("Subir archivo")
            .WithDescription("Sube un archivo a la categoría especificada (models, images, videos)")
            .WithEndpointLogging("UploadFile")
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<ApiResponse<FileUploadResult>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(413); // Payload Too Large

        // DELETE /api/v1/upload/{category}/{fileName}
        group.MapDelete("{category}/{fileName}", DeleteFile)
            .WithSummary("Eliminar archivo")
            .WithDescription("Elimina un archivo específico de una categoría")
            .WithEndpointLogging("DeleteFile")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(404);

        // GET /api/v1/upload/categories
        group.MapGet("categories", GetValidCategories)
            .WithSummary("Obtener categorías válidas")
            .WithDescription("Obtiene la lista de categorías válidas para subir archivos")
            .WithEndpointLogging("GetValidCategories")
            .Produces<ApiResponse<string[]>>(200);

        // === ENDPOINTS LEGACY ===
        
        // POST /api/upload/{category}
        legacyGroup.MapPost("{category}", UploadFile)
            .WithSummary("Subir archivo (Legacy)")
            .WithDescription("Sube un archivo a la categoría especificada (models, images, videos)")
            .WithEndpointLogging("UploadFile_Legacy")
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<ApiResponse<FileUploadResult>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(413); // Payload Too Large

        // DELETE /api/upload/{category}/{fileName}
        legacyGroup.MapDelete("{category}/{fileName}", DeleteFile)
            .WithSummary("Eliminar archivo (Legacy)")
            .WithDescription("Elimina un archivo específico de una categoría")
            .WithEndpointLogging("DeleteFile_Legacy")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(404);

        // GET /api/upload/categories
        legacyGroup.MapGet("categories", GetValidCategories)
            .WithSummary("Obtener categorías válidas (Legacy)")
            .WithDescription("Obtiene la lista de categorías válidas para subir archivos")
            .WithEndpointLogging("GetValidCategories_Legacy")
            .Produces<ApiResponse<string[]>>(200);
    }

    private static async Task<IResult> UploadFile(string category, IFormFile file, IFileUploadService service)
    {
        // Validar categoría
        if (!ValidCategories.Contains(category, StringComparer.OrdinalIgnoreCase))
        {
            return Results.BadRequest(ApiResponse<FileUploadResult>.ErrorResult(
                $"Invalid category. Valid categories: {string.Join(", ", ValidCategories)}"));
        }

        // Validar archivo
        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(ApiResponse<FileUploadResult>.ErrorResult("No file provided"));
        }

        // Validar tamaño (ejemplo: 50MB máximo)
        const long maxFileSize = 50 * 1024 * 1024; // 50MB
        if (file.Length > maxFileSize)
        {
            return Results.BadRequest(ApiResponse<FileUploadResult>.ErrorResult(
                $"File size exceeds maximum allowed size of {maxFileSize / (1024 * 1024)}MB"));
        }

        try
        {
            var result = await service.UploadFileAsync(file, category.ToLower());
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error uploading file: {ex.Message}", statusCode: 500);
        }
    }

    private static async Task<IResult> DeleteFile(string category, string fileName, IFileUploadService service)
    {
        // Validar categoría
        if (!ValidCategories.Contains(category, StringComparer.OrdinalIgnoreCase))
        {
            return Results.BadRequest(ApiResponse<bool>.ErrorResult(
                $"Invalid category. Valid categories: {string.Join(", ", ValidCategories)}"));
        }

        // Validar nombre de archivo
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return Results.BadRequest(ApiResponse<bool>.ErrorResult("File name is required"));
        }

        try
        {
            var result = await service.DeleteFileAsync(fileName, category.ToLower());
            return HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error deleting file: {ex.Message}", statusCode: 500);
        }
    }

    private static Task<IResult> GetValidCategories()
    {
        var response = ApiResponse<string[]>.SuccessResult(ValidCategories);
        return Task.FromResult(Results.Ok(response));
    }
}