using Microsoft.EntityFrameworkCore;
using QrAr.Api.Data;
using QrAr.Api.Services;

namespace QrAr.Api.Extensions;

/// <summary>
/// Métodos de extensión para configurar servicios
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Configura la base de datos
    /// </summary>
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection") ??
                             "Data Source=qr_ar.db"));
        
        return services;
    }

    /// <summary>
    /// Registra los servicios de la aplicación
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IExperienceService, ExperienceService>();
        services.AddScoped<IFileUploadService, FileUploadService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        
        return services;
    }

    /// <summary>
    /// Configura CORS
    /// </summary>
    public static IServiceCollection AddCustomCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins(
                        "https://localhost:3000",
                        "http://localhost:3000",
                        "http://192.168.0.5:3000",
                        "https://192.168.0.5:3000"
                      )
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });

            options.AddPolicy("AllowSwagger", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        return services;
    }

    /// <summary>
    /// Configura Swagger/OpenAPI
    /// </summary>
    public static IServiceCollection AddCustomSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new() 
            { 
                Title = "QR AR API", 
                Version = "v1",
                Description = "API para gestión de experiencias de Realidad Aumentada con códigos QR",
                Contact = new() 
                { 
                    Name = "QR AR Team" 
                }
            });
        });

        return services;
    }

    /// <summary>
    /// Configura logging mejorado
    /// </summary>
    public static IServiceCollection AddCustomLogging(this IServiceCollection services)
    {
        services.AddLogging(builder =>
        {
            builder.ClearProviders();
            builder.AddConsole();
            builder.AddDebug();
        });

        return services;
    }

    /// <summary>
    /// Configura compresión de respuestas
    /// </summary>
    public static IServiceCollection AddResponseCompression(this IServiceCollection services)
    {
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
        });

        return services;
    }

    /// <summary>
    /// Configura health checks
    /// </summary>
    public static IServiceCollection AddCustomHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks()
            .AddSqlite(configuration.GetConnectionString("DefaultConnection") ?? "Data Source=qr_ar.db", name: "database");

        return services;
    }
}