using Microsoft.AspNetCore.Mvc;
using QrAr.Api.Controllers.Base;

namespace QrAr.Api.Controllers;

/// <summary>
/// Endpoints para gestión de archivos
/// </summary>
public class FilesEndpointGroup : BaseEndpointGroup
{
    public override string RoutePrefix => "files";
    public override string Tag => "File Management";

    public override void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = CreateGroup(app);

        // GET /api/v1/files/models
        group.MapGet("models", ListModelFiles)
            .WithSummary("Listar archivos de modelos 3D")
            .WithDescription("Obtiene la lista de todos los archivos de modelos 3D disponibles")
            .Produces<List<FileInfo>>(200);

        // GET /api/v1/files/images
        group.MapGet("images", ListImageFiles)
            .WithSummary("Listar archivos de imágenes")
            .WithDescription("Obtiene la lista de todos los archivos de imágenes disponibles")
            .Produces<List<FileInfo>>(200);
    }

    private static IResult ListModelFiles(IWebHostEnvironment environment)
    {
        return ListFiles(environment, "models");
    }

    private static IResult ListImageFiles(IWebHostEnvironment environment)
    {
        return ListFiles(environment, "images");
    }

    private static IResult ListFiles(IWebHostEnvironment environment, string category)
    {
        try
        {
            var uploadsPath = Path.Combine(environment.WebRootPath, "uploads", category);
            
            if (!Directory.Exists(uploadsPath))
            {
                return Results.Json(new List<FileInfoDto>());
            }

            var files = Directory.GetFiles(uploadsPath)
                .Select(filePath => new System.IO.FileInfo(filePath))
                .Select(fileInfo => new FileInfoDto
                {
                    Name = fileInfo.Name,
                    Url = $"/uploads/{category}/{fileInfo.Name}",
                    Size = fileInfo.Length,
                    LastModified = fileInfo.LastWriteTime,
                    Extension = fileInfo.Extension.TrimStart('.')
                })
                .OrderByDescending(f => f.LastModified)
                .ToList();

            return Results.Json(files);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error listing files",
                detail: ex.Message,
                statusCode: 500
            );
        }
    }
}

public class FileInfoDto
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTime LastModified { get; set; }
    public string Extension { get; set; } = string.Empty;
}