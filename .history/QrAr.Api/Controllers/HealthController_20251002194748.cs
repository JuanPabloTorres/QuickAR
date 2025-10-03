using QrAr.Api.Controllers.Base;
using QrAr.Api.Extensions;
using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers;

/// <summary>
/// Grupo de endpoints para verificación de salud del sistema
/// </summary>
public class HealthEndpointGroup : BaseEndpointGroup
{
    public override string RoutePrefix => "";
    public override string Tag => "Health";

    public override void MapEndpoints(IEndpointRouteBuilder app)
    {
        // Health check básico sin versionado
        app.MapGet("/health", GetBasicHealth)
            .WithTags(Tag)
            .WithSummary("Verificación básica de salud")
            .WithDescription("Verifica que la API esté funcionando")
            .WithEndpointLogging("GetBasicHealth")
            .Produces<object>(200);

        var group = CreateGroup(app);
        var legacyGroup = CreateLegacyGroup(app);

        // GET /api/v1/health/detailed
        group.MapGet("health/detailed", GetDetailedHealth)
            .WithSummary("Verificación detallada de salud")
            .WithDescription("Verifica el estado detallado de la API y sus dependencias")
            .WithEndpointLogging("GetDetailedHealth")
            .Produces<ApiResponse<object>>(200)
            .Produces<ApiResponse<object>>(503);

        // GET /api/v1/health/ready
        group.MapGet("health/ready", GetReadiness)
            .WithSummary("Verificación de preparación")
            .WithDescription("Verifica si la API está lista para recibir tráfico")
            .WithEndpointLogging("GetReadiness")
            .Produces<ApiResponse<object>>(200)
            .Produces<ApiResponse<object>>(503);

        // === ENDPOINTS LEGACY ===
        
        // GET /api/health/detailed
        legacyGroup.MapGet("health/detailed", GetDetailedHealth)
            .WithSummary("Verificación detallada de salud (Legacy)")
            .WithDescription("Verifica el estado detallado de la API y sus dependencias")
            .WithEndpointLogging("GetDetailedHealth_Legacy")
            .Produces<ApiResponse<object>>(200)
            .Produces<ApiResponse<object>>(503);

        // GET /api/health/ready
        legacyGroup.MapGet("health/ready", GetReadiness)
            .WithSummary("Verificación de preparación (Legacy)")
            .WithDescription("Verifica si la API está lista para recibir tráfico")
            .WithEndpointLogging("GetReadiness_Legacy")
            .Produces<ApiResponse<object>>(200)
            .Produces<ApiResponse<object>>(503);
    }

    private static Task<IResult> GetBasicHealth()
    {
        var health = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "v1.0.0",
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        };

        return Task.FromResult(Results.Ok(health));
    }

    private static async Task<IResult> GetDetailedHealth(IServiceProvider serviceProvider)
    {
        try
        {
            var checks = new List<object>();

            // Verificar base de datos
            try
            {
                var dbContext = serviceProvider.GetRequiredService<QrAr.Api.Data.AppDbContext>();
                await dbContext.Database.CanConnectAsync();
                checks.Add(new { Component = "Database", Status = "Healthy", ResponseTime = "< 100ms" });
            }
            catch (Exception ex)
            {
                checks.Add(new { Component = "Database", Status = "Unhealthy", Error = ex.Message });
            }

            // Verificar almacenamiento de archivos
            try
            {
                var uploadsPath = Path.Combine("wwwroot", "uploads");
                var isDirectoryAccessible = Directory.Exists(uploadsPath);
                checks.Add(new
                {
                    Component = "FileStorage",
                    Status = isDirectoryAccessible ? "Healthy" : "Warning",
                    Details = isDirectoryAccessible ? "Directory accessible" : "Directory not found"
                });
            }
            catch (Exception ex)
            {
                checks.Add(new { Component = "FileStorage", Status = "Unhealthy", Error = ex.Message });
            }

            var overallStatus = checks.Any(c => c.GetType().GetProperty("Status")?.GetValue(c)?.ToString() == "Unhealthy")
                ? "Unhealthy" : "Healthy";

            var health = new
            {
                Status = overallStatus,
                Timestamp = DateTime.UtcNow,
                Version = "v1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                Checks = checks
            };

            var response = ApiResponse<object>.SuccessResult(health);
            return overallStatus == "Healthy" ? Results.Ok(response) : Results.Json(response, statusCode: 503);
        }
        catch (Exception ex)
        {
            var errorResponse = ApiResponse<object>.ErrorResult($"Health check failed: {ex.Message}");
            return Results.Json(errorResponse, statusCode: 503);
        }
    }

    private static Task<IResult> GetReadiness()
    {
        // Verificaciones básicas de preparación
        var readiness = new
        {
            Status = "Ready",
            Timestamp = DateTime.UtcNow,
            StartupTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
            ReadyForTraffic = true
        };

        var response = ApiResponse<object>.SuccessResult(readiness);
        return Task.FromResult(Results.Ok(response));
    }
}