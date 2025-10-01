using QrAr.Api.DTOs;

namespace QrAr.Api.Services;

public interface IFileUploadService
{
    Task<ApiResponse<FileUploadResult>> UploadFileAsync(IFormFile file, string category);
    Task<ApiResponse<bool>> DeleteFileAsync(string fileName, string category);
    bool IsValidFileType(IFormFile file, string category);
    string GetFileUrl(string fileName, string category);
}