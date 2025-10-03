using System.Reflection;
using QrAr.Api.Controllers.Base;

namespace QrAr.Api.Extensions;

/// <summary>
/// Extensiones para registro automático de grupos de endpoints
/// </summary>
public static class EndpointGroupExtensions
{
    /// <summary>
    /// Registra automáticamente todos los grupos de endpoints encontrados en el assembly
    /// </summary>
    public static WebApplication MapEndpointGroups(this WebApplication app)
    {
        var endpointGroupTypes = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && typeof(IEndpointGroup).IsAssignableFrom(t));

        foreach (var type in endpointGroupTypes)
        {
            if (Activator.CreateInstance(type) is IEndpointGroup endpointGroup)
            {
                endpointGroup.MapEndpoints(app);
            }
        }

        return app;
    }

    /// <summary>
    /// Registra grupos de endpoints específicos
    /// </summary>
    public static WebApplication MapEndpointGroups(this WebApplication app, params Type[] endpointGroupTypes)
    {
        foreach (var type in endpointGroupTypes)
        {
            if (!typeof(IEndpointGroup).IsAssignableFrom(type))
            {
                throw new ArgumentException($"Type {type.Name} does not implement IEndpointGroup");
            }

            if (Activator.CreateInstance(type) is IEndpointGroup endpointGroup)
            {
                endpointGroup.MapEndpoints(app);
            }
        }

        return app;
    }

    /// <summary>
    /// Agrega middleware de logging para endpoints
    /// </summary>
    public static RouteHandlerBuilder WithEndpointLogging(this RouteHandlerBuilder builder, string endpointName)
    {
        return builder.AddEndpointFilter(async (context, next) =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<object>>();
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            logger.LogInformation("Starting execution of endpoint: {EndpointName}", endpointName);
            
            try
            {
                var result = await next(context);
                stopwatch.Stop();
                logger.LogInformation("Completed execution of endpoint: {EndpointName} in {ElapsedMs}ms", 
                    endpointName, stopwatch.ElapsedMilliseconds);
                return result;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                logger.LogError(ex, "Error in endpoint: {EndpointName} after {ElapsedMs}ms", 
                    endpointName, stopwatch.ElapsedMilliseconds);
                throw;
            }
        });
    }

    /// <summary>
    /// Agrega validación automática de modelo
    /// </summary>
    public static RouteHandlerBuilder WithModelValidation<T>(this RouteHandlerBuilder builder) where T : class
    {
        return builder.AddEndpointFilter<ValidationFilter<T>>();
    }
}