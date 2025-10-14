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

public record AnalyticsSummaryDto(
    int TotalEvents,
    int TotalViews,
    int UniqueUsers,
    int TotalExperiences,
    double AverageTimeSpent,
    double ConversionRate,
    DateTime? LastEventDate,
    Dictionary<string, int> EventTypeBreakdown
);

public record DeviceStatsDto(
    string DeviceName,
    int Count,
    double Percentage
);

public record TimeSeriesDataDto(
    string Period,
    int Views,
    int Interactions
);

public record ExperienceStatsDto(
    Guid ExperienceId,
    string ExperienceName,
    int ViewCount,
    int InteractionCount,
    DateTime? LastViewed
);