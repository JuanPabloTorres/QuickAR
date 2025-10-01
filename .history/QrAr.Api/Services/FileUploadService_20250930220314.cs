using QrAr.Api.DTOs;

namespace QrAr.Api.Services;

public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileUploadService> _logger;
    private readonly Dictionary<string, string[]> _allowedMimeTypes;
    private readonly Dictionary<string, long> _maxFileSizes;

    public FileUploadService(IWebHostEnvironment environment, ILogger<FileUploadService> logger)
    {
        _environment = environment;
        _logger = logger;
        
        _allowedMimeTypes = new Dictionary<string, string[]>
        {
            ["models"] = new[] { "model/gltf-binary", "model/gltf+json", "application/octet-stream" },
            ["images"] = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" },
            ["videos"] = new[] { "video/mp4", "video/webm", "video/ogg" }
        };

        _maxFileSizes = new Dictionary<string, long>
        {
            ["models"] = 50 * 1024 * 1024, // 50MB
            ["images"] = 10 * 1024 * 1024, // 10MB
            ["videos"] = 100 * 1024 * 1024 // 100MB
        };
    }

    public async Task<ApiResponse<FileUploadResult>> UploadFileAsync(IFormFile file, string category)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return ApiResponse<FileUploadResult>.ErrorResult("No file provided");
            }

            if (!IsValidFileType(file, category))
            {
                return ApiResponse<FileUploadResult>.ErrorResult("Invalid file type");
            }

            if (!IsValidFileSize(file, category))
            {
                var maxSize = _maxFileSizes[category] / (1024 * 1024);
                return ApiResponse<FileUploadResult>.ErrorResult($"File size exceeds {maxSize}MB limit");
            }

            var uploadDir = Path.Combine(_environment.WebRootPath, "uploads", category);
            Directory.CreateDirectory(uploadDir);

            var fileName = GenerateUniqueFileName(file.FileName);
            var filePath = Path.Combine(uploadDir, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var fileUrl = GetFileUrl(fileName, category);
            
            var result = new FileUploadResult(
                fileName,
                fileUrl,
                file.ContentType,
                file.Length
            );

            _logger.LogInformation("File uploaded successfully: {FileName} to {Category}", fileName, category);
            return ApiResponse<FileUploadResult>.SuccessResult(result, "File uploaded successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to category: {Category}", category);
            return ApiResponse<FileUploadResult>.ErrorResult("Error uploading file");
        }
    }

    public async Task<ApiResponse<bool>> DeleteFileAsync(string fileName, string category)
    {
        try
        {
            var filePath = Path.Combine(_environment.WebRootPath, "uploads", category, fileName);
            
            if (!File.Exists(filePath))
            {
                return ApiResponse<bool>.ErrorResult("File not found");
            }

            await Task.Run(() => File.Delete(filePath));
            
            _logger.LogInformation("File deleted successfully: {FileName} from {Category}", fileName, category);
            return ApiResponse<bool>.SuccessResult(true, "File deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FileName} from {Category}", fileName, category);
            return ApiResponse<bool>.ErrorResult("Error deleting file");
        }
    }

    public bool IsValidFileType(IFormFile file, string category)
    {
        if (!_allowedMimeTypes.ContainsKey(category))
            return false;

        var allowedTypes = _allowedMimeTypes[category];
        return allowedTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase);
    }

    public string GetFileUrl(string fileName, string category)
    {
        return $"/uploads/{category}/{fileName}";
    }

    private bool IsValidFileSize(IFormFile file, string category)
    {
        if (!_maxFileSizes.ContainsKey(category))
            return false;

        return file.Length <= _maxFileSizes[category];
    }

    private static string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var guid = Guid.NewGuid().ToString("N")[..8];
        
        return $"{timestamp}_{guid}{extension}";
    }
}