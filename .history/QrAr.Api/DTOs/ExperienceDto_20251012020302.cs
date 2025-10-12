using QrAr.Api.Models;

namespace QrAr.Api.DTOs;

public record AssetDto(
    Guid Id,
    string Name,
    string Kind, // "message" | "video" | "image" | "model3d" | "webcontent"
    string? Url,
    string? MimeType,
    long? FileSizeBytes,
    string? Text
);

public record ExperienceDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    bool IsActive,
    IEnumerable<AssetDto> Assets,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ExperienceCreateDto(
    string Title,
    string? Slug,
    string? Description,
    IEnumerable<AssetCreateDto>? Assets
);

public record ExperienceUpdateDto(
    string Title,
    string? Slug,
    string? Description,
    bool IsActive,
    IEnumerable<AssetCreateDto>? Assets
);

public record AssetCreateDto(
    string Name,
    string Kind, // "message" | "video" | "image" | "model3d" | "webcontent"
    string? Url,
    string? MimeType,
    long? FileSizeBytes,
    string? Text
);

public static class MappingExtensions
{
    public static AssetDto ToDto(this Asset asset)
    {
        // Map backend enum values to frontend string values
        var kindString = asset.Kind switch
        {
            AssetKind.Message => "message",
            AssetKind.Video => "video",
            AssetKind.Image => "image",
            AssetKind.Model3D => "model3d",
            AssetKind.WebContent => "webcontent",
            _ => throw new ArgumentException($"Invalid asset kind: {asset.Kind}")
        };

        return new AssetDto(
            asset.Id,
            asset.Name,
            kindString,
            asset.Url,
            asset.MimeType,
            asset.FileSizeBytes,
            asset.Text
        );
    }

    public static ExperienceDto ToDto(this Experience experience)
    {
        return new ExperienceDto(
            experience.Id,
            experience.Title,
            experience.Slug,
            experience.Description,
            experience.IsActive,
            experience.Assets.Select(a => a.ToDto()),
            experience.CreatedAt,
            experience.UpdatedAt
        );
    }

    public static Asset ToEntity(this AssetCreateDto dto, Guid experienceId)
    {
        // Map frontend enum values to backend enum values
        var kind = dto.Kind.ToLowerInvariant() switch
        {
            "message" => AssetKind.Message,
            "video" => AssetKind.Video,
            "image" => AssetKind.Image,
            "model3d" => AssetKind.Model3D,
            "webcontent" => AssetKind.WebContent,
            _ => throw new ArgumentException($"Invalid asset kind: {dto.Kind}")
        };

        return new Asset
        {
            Name = dto.Name,
            Kind = kind,
            Url = dto.Url,
            MimeType = dto.MimeType,
            FileSizeBytes = dto.FileSizeBytes,
            Text = dto.Text,
            ExperienceId = experienceId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}