using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QrAr.Api.Models;

public enum AssetKind
{
    Message,
    Video,
    Image,
    Model3D,
    WebContent
}

public class Asset : BaseModel
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public AssetKind Kind { get; set; }
    
    [MaxLength(500)]
    public string? Url { get; set; }
    
    [MaxLength(100)]
    public string? MimeType { get; set; }
    
    public long? FileSizeBytes { get; set; }
    
    [MaxLength(2000)]
    public string? Text { get; set; } // For message assets
    
    // Foreign key
    [Required]
    public Guid ExperienceId { get; set; }
    
    // Navigation property
    [ForeignKey(nameof(ExperienceId))]
    public virtual Experience Experience { get; set; } = null!;
}