using Microsoft.EntityFrameworkCore;
using QrAr.Api.Data;
using QrAr.Api.DTOs;
using QrAr.Api.Models;
using System.Text.RegularExpressions;

namespace QrAr.Api.Services;

public class ExperienceService : IExperienceService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ExperienceService> _logger;

    public ExperienceService(AppDbContext context, ILogger<ExperienceService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<IEnumerable<ExperienceDto>>> GetAllAsync()
    {
        try
        {
            // GetAll without userId - returns all experiences (for admin use)
            var experiences = await _context.Experiences
                .Include(e => e.Assets)
                .Include(e => e.User)
                .OrderByDescending(e => e.UpdatedAt)
                .ToListAsync();

            var dtos = experiences.Select(e => e.ToDto());

            return ApiResponse<IEnumerable<ExperienceDto>>.SuccessResult(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all experiences");
            return ApiResponse<IEnumerable<ExperienceDto>>.ErrorResult("Error retrieving experiences");
        }
    }

    public async Task<ApiResponse<IEnumerable<ExperienceDto>>> GetAllByUserIdAsync(Guid userId)
    {
        try
        {
            // Get only experiences for the specific user
            var experiences = await _context.Experiences
                .Include(e => e.Assets)
                .Include(e => e.User)
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.UpdatedAt)
                .ToListAsync();

            var dtos = experiences.Select(e => e.ToDto());

            _logger.LogInformation("Retrieved {Count} experiences for user {UserId}", experiences.Count, userId);

            return ApiResponse<IEnumerable<ExperienceDto>>.SuccessResult(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting experiences for user {UserId}", userId);
            return ApiResponse<IEnumerable<ExperienceDto>>.ErrorResult("Error retrieving experiences");
        }
    }

    public async Task<ApiResponse<ExperienceDto?>> GetByIdAsync(Guid id)
    {
        try
        {
            var experience = await _context.Experiences
                .Include(e => e.Assets)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (experience == null)
            {
                return ApiResponse<ExperienceDto?>.ErrorResult("Experience not found");
            }

            return ApiResponse<ExperienceDto?>.SuccessResult(experience.ToDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting experience by id: {Id}", id);

            return ApiResponse<ExperienceDto?>.ErrorResult("Error retrieving experience");
        }
    }

    public async Task<ApiResponse<ExperienceDto?>> GetBySlugAsync(string slug)
    {
        try
        {
            var experience = await _context.Experiences
                .Include(e => e.Assets)
                .FirstOrDefaultAsync(e => e.Slug == slug && e.IsActive);

            if (experience == null)
            {
                return ApiResponse<ExperienceDto?>.ErrorResult("Experience not found");
            }

            return ApiResponse<ExperienceDto?>.SuccessResult(experience.ToDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting experience by slug: {Slug}", slug);

            return ApiResponse<ExperienceDto?>.ErrorResult("Error retrieving experience");
        }
    }

    public async Task<ApiResponse<ExperienceDto>> CreateAsync(ExperienceCreateDto dto, Guid userId)
    {
        try
        {
            var validationErrors = ValidateExperienceDto(dto);

            if (validationErrors.Any())
            {
                return ApiResponse<ExperienceDto>.ErrorResult(validationErrors);
            }

            var slug = GenerateSlug(dto.Slug ?? dto.Title);

            // Check if slug is unique
            if (await _context.Experiences.AnyAsync(e => e.Slug == slug))
            {
                slug = await GenerateUniqueSlug(slug);
            }

            var experience = new Experience
            {
                Title = dto.Title,
                Slug = slug,
                Description = dto.Description,
                IsActive = true,
                UserId = userId // Assign the user
            };

            if (dto.Assets != null)
            {
                foreach (var assetDto in dto.Assets)
                {
                    var asset = assetDto.ToEntity(experience.Id);
                    experience.Assets.Add(asset);
                }
            }

            _context.Experiences.Add(experience);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Created experience: {Title} with slug: {Slug} for user: {UserId}", dto.Title, slug, userId);

            return ApiResponse<ExperienceDto>.SuccessResult(experience.ToDto(), "Experience created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating experience: {Title} for user: {UserId}", dto.Title, userId);

            return ApiResponse<ExperienceDto>.ErrorResult("Error creating experience");
        }
    }

    public async Task<ApiResponse<ExperienceDto>> UpdateAsync(Guid id, ExperienceUpdateDto dto)
    {
        try
        {
            _logger.LogInformation("Starting update for experience: {Id}", id);

            var validationErrors = ValidateExperienceUpdateDto(dto);

            if (validationErrors.Any())
            {
                _logger.LogWarning("Validation errors for experience {Id}: {Errors}", id, string.Join(", ", validationErrors));

                return ApiResponse<ExperienceDto>.ErrorResult(validationErrors);
            }

            var experience = await _context.Experiences
                .Include(e => e.Assets)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (experience == null)
            {
                _logger.LogWarning("Experience not found: {Id}", id);

                return ApiResponse<ExperienceDto>.ErrorResult("Experience not found");
            }

            _logger.LogInformation("Found experience: {Title}, Assets count: {Count}", experience.Title, experience.Assets.Count);

            var slug = GenerateSlug(dto.Slug ?? dto.Title);

            // Check if slug is unique (excluding current experience)
            if (await _context.Experiences.AnyAsync(e => e.Slug == slug && e.Id != id))
            {
                slug = await GenerateUniqueSlug(slug);
            }

            experience.Title = dto.Title;

            experience.Slug = slug;

            experience.Description = dto.Description;

            experience.IsActive = dto.IsActive;

            // Update assets - Simplified approach
            if (dto.Assets != null)
            {
                _logger.LogInformation("Updating assets. Incoming assets count: {Count}", dto.Assets.Count());

                // Delete all existing assets for this experience
                var existingAssets = await _context.Assets
                    .Where(a => a.ExperienceId == experience.Id)
                    .ToListAsync();

                _context.Assets.RemoveRange(existingAssets);

                await _context.SaveChangesAsync(); // Save the deletions first

                // Add new assets
                var newAssets = new List<Asset>();

                foreach (var assetDto in dto.Assets)
                {
                    _logger.LogInformation("Processing asset: {Name}, Kind: {Kind}", assetDto.Name, assetDto.Kind);

                    try
                    {
                        var asset = assetDto.ToEntity(experience.Id);

                        newAssets.Add(asset);

                        _logger.LogInformation("Successfully processed asset: {Name}", assetDto.Name);
                    }
                    catch (Exception assetEx)
                    {
                        _logger.LogError(assetEx, "Error creating asset: {Name}, Kind: {Kind}", assetDto.Name, assetDto.Kind);

                        throw;
                    }
                }

                _context.Assets.AddRange(newAssets);
            }

            _logger.LogInformation("Attempting to save changes...");

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully saved changes for experience: {Id}", id);

            return ApiResponse<ExperienceDto>.SuccessResult(experience.ToDto(), "Experience updated successfully");
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Concurrency conflict updating experience: {Id}. The experience may have been modified by another user.", id);

            return ApiResponse<ExperienceDto>.ErrorResult("The experience was modified by another user. Please refresh and try again.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating experience: {Id}, Message: {Message}", id, ex.Message);

            return ApiResponse<ExperienceDto>.ErrorResult("Error updating experience");
        }
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        try
        {
            var experience = await _context.Experiences.FindAsync(id);

            if (experience == null)
            {
                return ApiResponse<bool>.ErrorResult("Experience not found");
            }

            _context.Experiences.Remove(experience);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted experience: {Id}", id);

            return ApiResponse<bool>.SuccessResult(true, "Experience deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting experience: {Id}", id);

            return ApiResponse<bool>.ErrorResult("Error deleting experience");
        }
    }

    public async Task<ApiResponse<bool>> ToggleActiveAsync(Guid id)
    {
        try
        {
            var experience = await _context.Experiences.FindAsync(id);

            if (experience == null)
            {
                return ApiResponse<bool>.ErrorResult("Experience not found");
            }

            experience.IsActive = !experience.IsActive;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Toggled active status for experience: {Id} to {IsActive}", id, experience.IsActive);

            return ApiResponse<bool>.SuccessResult(true, $"Experience {(experience.IsActive ? "activated" : "deactivated")} successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling active status for experience: {Id}", id);

            return ApiResponse<bool>.ErrorResult("Error updating experience status");
        }
    }

    private static string GenerateSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Convert to lowercase and replace spaces with hyphens
        var slug = input.ToLowerInvariant().Replace(" ", "-");

        // Remove special characters, keep only letters, numbers, and hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remove multiple consecutive hyphens
        slug = Regex.Replace(slug, @"-+", "-");

        // Remove leading and trailing hyphens
        slug = slug.Trim('-');

        return slug;
    }

    private async Task<string> GenerateUniqueSlug(string baseSlug)
    {
        var counter = 1;

        var uniqueSlug = $"{baseSlug}-{counter}";

        while (await _context.Experiences.AnyAsync(e => e.Slug == uniqueSlug))
        {
            counter++;

            uniqueSlug = $"{baseSlug}-{counter}";
        }

        return uniqueSlug;
    }

    private static List<string> ValidateExperienceDto(ExperienceCreateDto dto)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Title))
            errors.Add("Title is required");

        if (dto.Title?.Length > 200)
            errors.Add("Title cannot exceed 200 characters");

        if (dto.Description?.Length > 1000)
            errors.Add("Description cannot exceed 1000 characters");

        return errors;
    }

    private static List<string> ValidateExperienceUpdateDto(ExperienceUpdateDto dto)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Title))
            errors.Add("Title is required");

        if (dto.Title?.Length > 200)
            errors.Add("Title cannot exceed 200 characters");

        if (dto.Description?.Length > 1000)
            errors.Add("Description cannot exceed 1000 characters");

        return errors;
    }
}