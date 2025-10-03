using Microsoft.AspNetCore.Mvc;

namespace QrAr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> GetHealth()
    {
        return Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow });
    }

    // Minimal API Extension Method
    public static void MapHealthEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
            .WithTags("Health")
            .WithSummary("Health check");
    }
}