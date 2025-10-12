using QrAr.Api.DTOs;

namespace QrAr.Api.Controllers.Base;

/// <summary>
/// Clase base abstracta para grupos de endpoints
/// </summary>
public abstract class BaseEndpointGroup : IEndpointGroup
{
    public abstract string RoutePrefix { get; }
    public abstract string Tag { get; }
    public virtual string Version { get; } = "v1";

    public abstract void MapEndpoints(IEndpointRouteBuilder app);

    /// <summary>
    /// Crea un grupo de rutas con configuración base común
    /// </summary>
    protected RouteGroupBuilder CreateGroup(IEndpointRouteBuilder app)
    {
        return app.MapGroup($"/api/{Version}/{RoutePrefix}")
            .WithTags(Tag);
    }

    /// <summary>
    /// Crea un grupo de rutas sin versionado para compatibilidad hacia atrás
    /// </summary>
    protected RouteGroupBuilder CreateLegacyGroup(IEndpointRouteBuilder app)
    {
        return app.MapGroup($"/api/{RoutePrefix}")
            .WithTags($"{Tag} (Legacy)");
    }

    /// <summary>
    /// Maneja respuestas de servicio de forma consistente
    /// </summary>
    protected static IResult HandleServiceResponse<T>(ApiResponse<T> response)
    {
        return response.Success switch
        {
            true when response.Data != null => Results.Ok(response),
            true when response.Data == null => Results.NotFound(response),
            false when response.Message?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true => Results.NotFound(response),
            false when response.Message?.Contains("validation", StringComparison.OrdinalIgnoreCase) == true => Results.BadRequest(response),
            false when response.Message?.Contains("unauthorized", StringComparison.OrdinalIgnoreCase) == true => Results.Unauthorized(),
            false when response.Message?.Contains("forbidden", StringComparison.OrdinalIgnoreCase) == true => Results.Forbid(),
            _ => Results.Problem(response.Message ?? "An error occurred", statusCode: 500)
        };
    }

    /// <summary>
    /// Maneja respuestas de creación
    /// </summary>
    protected static IResult HandleCreationResponse<T>(ApiResponse<T> response, string locationPath)
    {
        return response.Success
            ? Results.Created(locationPath, response)
            : HandleServiceResponse(response);
    }

    /// <summary>
    /// Valida entrada y ejecuta acción
    /// </summary>
    protected static async Task<IResult> ValidateAndExecute<TInput, TOutput>(
        TInput input,
        Func<TInput, Task<ApiResponse<TOutput>>> action,
        string? locationPath = null)
    {
        if (input == null)
        {
            return Results.BadRequest(ApiResponse<TOutput>.ErrorResult("Invalid input data"));
        }

        try
        {
            var result = await action(input);

            return locationPath != null
                ? HandleCreationResponse(result, locationPath)
                : HandleServiceResponse(result);
        }
        catch (Exception ex)
        {
            return Results.Problem($"An unexpected error occurred: {ex.Message}", statusCode: 500);
        }
    }
}