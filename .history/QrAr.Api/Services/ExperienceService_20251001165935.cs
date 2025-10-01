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
            var experiences = await _context.Experiences
                .Include(e => e.Assets)
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

    public async Task<ApiResponse<ExperienceDto>> CreateAsync(ExperienceCreateDto dto)
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
                IsActive = true
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

            _logger.LogInformation("Created experience: {Title} with slug: {Slug}", dto.Title, slug);
            return ApiResponse<ExperienceDto>.SuccessResult(experience.ToDto(), "Experience created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating experience: {Title}", dto.Title);
            return ApiResponse<ExperienceDto>.ErrorResult("Error creating experience");
        }
    }

    public async Task<ApiResponse<ExperienceDto>> UpdateAsync(Guid id, ExperienceUpdateDto dto)
    {
        try
        {
            var validationErrors = ValidateExperienceUpdateDto(dto);

            if (validationErrors.Any())
            {
                return ApiResponse<ExperienceDto>.ErrorResult(validationErrors);
            }

            var experience = await _context.Experiences
                .Include(e => e.Assets)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (experience == null)
            {
                return ApiResponse<ExperienceDto>.ErrorResult("Experience not found");
            }

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

            // Update assets
            if (dto.Assets != null)
            {
                // Remove existing assets
                _context.Assets.RemoveRange(experience.Assets);

                experience.Assets.Clear();

                // Add new assets
                foreach (var assetDto in dto.Assets)
                {
                    var asset = assetDto.ToEntity(experience.Id);

                    experience.Assets.Add(asset);
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated experience: {Id}", id);

            return ApiResponse<ExperienceDto>.SuccessResult(experience.ToDto(), "Experience updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating experience: {Id}", id);

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