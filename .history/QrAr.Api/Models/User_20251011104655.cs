using System.ComponentModel.DataAnnotations;

namespace QrAr.Api.Models
{
    public class User : BaseModel
    {
        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsEmailConfirmed { get; set; } = false;

        public DateTime? LastLoginAt { get; set; }

        [MaxLength(50)]
        public string Role { get; set; } = "User"; // Admin, User, etc.

        // Navigation properties
        public virtual ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    }
}