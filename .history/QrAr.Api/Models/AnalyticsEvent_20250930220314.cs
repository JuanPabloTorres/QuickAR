using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QrAr.Api.Models;

public class AnalyticsEvent : BaseModel
{
    [Required]
    [MaxLength(100)]
    public string EventType { get; set; } = string.Empty; // "view", "interaction", "scan", etc.
    
    [Required]
    public Guid ExperienceId { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    [MaxLength(50)]
    public string? IpAddress { get; set; }
    
    [MaxLength(200)]
    public string? Referrer { get; set; }
    
    [MaxLength(1000)]
    public string? AdditionalData { get; set; } // JSON data
    
    // Navigation property
    [ForeignKey(nameof(ExperienceId))]
    public virtual Experience Experience { get; set; } = null!;
}