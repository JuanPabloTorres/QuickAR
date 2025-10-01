namespace QrAr.Api.DTOs;

public record AnalyticsEventDto(
    Guid Id,
    string EventType,
    Guid ExperienceId,
    string? UserAgent,
    string? IpAddress,
    string? Referrer,
    string? AdditionalData,
    DateTime CreatedAt
);

public record AnalyticsEventCreateDto(
    string EventType,
    Guid ExperienceId,
    string? UserAgent,
    string? IpAddress,
    string? Referrer,
    string? AdditionalData
);