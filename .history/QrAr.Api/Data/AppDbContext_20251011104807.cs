using Microsoft.EntityFrameworkCore;
using QrAr.Api.Models;

namespace QrAr.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Experience> Experiences { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<AnalyticsEvent> AnalyticsEvents { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Experience configuration
        modelBuilder.Entity<Experience>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(1000);
            
            // Configure relationships
            entity.HasMany(e => e.Assets)
                  .WithOne(a => a.Experience)
                  .HasForeignKey(a => a.ExperienceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Asset configuration
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).IsRequired().HasMaxLength(200);
            entity.Property(a => a.Kind).IsRequired();
            entity.Property(a => a.Url).HasMaxLength(500);
            entity.Property(a => a.MimeType).HasMaxLength(100);
            entity.Property(a => a.Text).HasMaxLength(2000);
            
            // Convert enum to string
            entity.Property(a => a.Kind)
                  .HasConversion<string>();
        });

        // AnalyticsEvent configuration
        modelBuilder.Entity<AnalyticsEvent>(entity =>
        {
            entity.HasKey(ae => ae.Id);
            entity.Property(ae => ae.EventType).IsRequired().HasMaxLength(100);
            entity.Property(ae => ae.UserAgent).HasMaxLength(500);
            entity.Property(ae => ae.IpAddress).HasMaxLength(50);
            entity.Property(ae => ae.Referrer).HasMaxLength(200);
            entity.Property(ae => ae.AdditionalData).HasMaxLength(1000);
            
            // Configure relationship
            entity.HasOne(ae => ae.Experience)
                  .WithMany()
                  .HasForeignKey(ae => ae.ExperienceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FirstName).HasMaxLength(100);
            entity.Property(u => u.LastName).HasMaxLength(100);
            entity.Property(u => u.Role).HasMaxLength(50);
            
            // Configure relationships
            entity.HasMany(u => u.Experiences)
                  .WithOne()
                  .HasForeignKey("UserId")
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Note: Seed data will be added via a seeder service
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseModel && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseModel)entry.Entity;
            
            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
            
            entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}