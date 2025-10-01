namespace QrAr.Api.DTOs;

public record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message,
    IEnumerable<string>? Errors
)
{
    public static ApiResponse<T> SuccessResult(T data, string? message = null)
        => new(true, data, message, null);

    public static ApiResponse<T> ErrorResult(string message, IEnumerable<string>? errors = null)
        => new(false, default, message, errors);

    public static ApiResponse<T> ErrorResult(IEnumerable<string> errors)
        => new(false, default, "Validation failed", errors);
}

public record FileUploadResult(
    string FileName,
    string Url,
    string MimeType,
    long SizeBytes
);