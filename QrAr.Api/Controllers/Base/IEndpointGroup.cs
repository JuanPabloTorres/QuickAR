namespace QrAr.Api.Controllers.Base;

/// <summary>
/// Interface para definir grupos de endpoints de Minimal API
/// </summary>
public interface IEndpointGroup
{
    /// <summary>
    /// Mapea los endpoints del grupo al router
    /// </summary>
    /// <param name="app">El endpoint route builder</param>
    void MapEndpoints(IEndpointRouteBuilder app);

    /// <summary>
    /// Prefijo de la ruta base para el grupo
    /// </summary>
    string RoutePrefix { get; }

    /// <summary>
    /// Tag para documentación de Swagger
    /// </summary>
    string Tag { get; }

    /// <summary>
    /// Versión de la API
    /// </summary>
    string Version { get; }
}