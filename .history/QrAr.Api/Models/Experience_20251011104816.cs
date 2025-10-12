using System.ComponentModel.DataAnnotations;

namespace QrAr.Api.Models;

public class Experience : BaseModel
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Foreign key for User
    public Guid? UserId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    public virtual ICollection<Asset> Assets { get; set; } = new List<Asset>();
}