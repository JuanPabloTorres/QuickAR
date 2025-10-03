namespace QrAr.Api.Controllers;

public static class HealthController
{

    // Minimal API Extension Method
    public static void MapHealthEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
            .WithTags("Health")
            .WithSummary("Health check");
    }
}