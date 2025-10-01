using QrAr.Api.Data;
using QrAr.Api.Models;

namespace QrAr.Api.Services;

public class DatabaseSeederService
{
    private readonly AppDbContext _context;
    private readonly ILogger<DatabaseSeederService> _logger;

    public DatabaseSeederService(AppDbContext context, ILogger<DatabaseSeederService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Check if we already have data
            if (await _context.Experiences.AnyAsync())
            {
                _logger.LogInformation("Database already has data. Skipping seed.");
                return;
            }

            _logger.LogInformation("Seeding database with initial data...");

            // Create sample experiences
            var experiences = new List<Experience>
            {
                new Experience
                {
                    Id = Guid.NewGuid(),
                    Title = "Welcome to AR",
                    Slug = "welcome-ar",
                    Description = "A simple introduction to augmented reality experiences",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Assets = new List<Asset>
                    {
                        new Asset
                        {
                            Id = Guid.NewGuid(),
                            Name = "Welcome Text",
                            Kind = AssetKind.Text,
                            Text = "¡Bienvenido a la experiencia AR!",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        }
                    }
                },
                new Experience
                {
                    Id = Guid.NewGuid(),
                    Title = "3D Model Demo",
                    Slug = "3d-model-demo",
                    Description = "Demonstrates 3D model rendering in AR",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Assets = new List<Asset>
                    {
                        new Asset
                        {
                            Id = Guid.NewGuid(),
                            Name = "Demo Model",
                            Kind = AssetKind.Model3D,
                            Url = "/models/demo.glb",
                            MimeType = "model/gltf-binary",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        }
                    }
                }
            };

            await _context.Experiences.AddRangeAsync(experiences);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Successfully seeded {experiences.Count} experiences to database.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            throw;
        }
    }
}