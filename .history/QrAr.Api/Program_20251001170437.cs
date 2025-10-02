using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using QrAr.Api.Data;
using QrAr.Api.DTOs;
using QrAr.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ??
                     "Data Source=qr_ar.db"));

// Register application services
builder.Services.AddScoped<IExperienceService, ExperienceService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

// Configure JSON options
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// Add response compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=qr_ar.db");

// Add CORS
builder.Services.AddCors(options =>
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

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "QR AR API", 
        Version = "v1",
        Description = "API para gestión de experiencias de Realidad Aumentada con códigos QR",
        Contact = new() { Name = "QR AR Team" }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline

// Global exception handling middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An unhandled exception occurred");
        
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var response = ApiResponse<object>.ErrorResult("An internal server error occurred");
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
});

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    await next();
});

app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QR AR API v1");
        c.RoutePrefix = "swagger";
    });
    app.UseCors("AllowSwagger");
}
else
{
    app.UseCors("AllowFrontend");
    app.UseHttpsRedirection();
}
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Add CORS headers to static files
        ctx.Context.Response.Headers["Access-Control-Allow-Origin"] = "*";
        ctx.Context.Response.Headers["Access-Control-Allow-Methods"] = "GET";
        ctx.Context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type";
    }
}); // For serving uploaded files

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
}

// Helper function for consistent API responses
static IResult HandleServiceResult<T>(ApiResponse<T> result) where T : class
{
    return result.Success switch
    {
        true when result.Data != null => Results.Ok(result),
        true => Results.NoContent(),
        false when result.Message?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true => Results.NotFound(result),
        _ => Results.BadRequest(result)
    };
}

// Input validation helper
static IResult? ValidateInput<T>(T input) where T : class
{
    if (input == null)
        return Results.BadRequest(ApiResponse<object>.ErrorResult("Request body is required"));
    
    var validationContext = new ValidationContext(input);
    var validationResults = new List<ValidationResult>();
    
    if (!Validator.TryValidateObject(input, validationContext, validationResults, true))
    {
        var errors = string.Join(", ", validationResults.Select(v => v.ErrorMessage));
        return Results.BadRequest(ApiResponse<object>.ErrorResult($"Validation failed: {errors}"));
    }
    
    return null;
}

// Experience endpoints group
var experiencesGroup = app.MapGroup("/api/experiences")
    .WithTags("Experiences")
    .WithOpenApi();

// Experience endpoints
app.MapGet("/api/experiences", async (IExperienceService service) =>
{
    var result = await service.GetAllAsync();
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("Experiences")
.WithSummary("Get all experiences");

app.MapGet("/api/experiences/{id:guid}", async (Guid id, IExperienceService service) =>
{
    var result = await service.GetByIdAsync(id);
    return result.Success ? Results.Ok(result) : Results.NotFound(result);
})
.WithTags("Experiences")
.WithSummary("Get experience by ID");

app.MapGet("/api/experiences/slug/{slug}", async (string slug, IExperienceService service) =>
{
    var result = await service.GetBySlugAsync(slug);
    return result.Success ? Results.Ok(result) : Results.NotFound(result);
})
.WithTags("Experiences")
.WithSummary("Get experience by slug");

app.MapPost("/api/experiences", async (ExperienceCreateDto dto, IExperienceService service) =>
{
    var result = await service.CreateAsync(dto);
    return result.Success ? Results.Created($"/api/experiences/{result.Data!.Id}", result) : Results.BadRequest(result);
})
.WithTags("Experiences")
.WithSummary("Create new experience");

app.MapPut("/api/experiences/{id:guid}", async (Guid id, ExperienceUpdateDto dto, IExperienceService service) =>
{
    var result = await service.UpdateAsync(id, dto);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("Experiences")
.WithSummary("Update experience");

app.MapDelete("/api/experiences/{id:guid}", async (Guid id, IExperienceService service) =>
{
    var result = await service.DeleteAsync(id);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("Experiences")
.WithSummary("Delete experience");

app.MapPatch("/api/experiences/{id:guid}/toggle-active", async (Guid id, IExperienceService service) =>
{
    var result = await service.ToggleActiveAsync(id);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("Experiences")
.WithSummary("Toggle experience active status");

// File upload endpoints
app.MapPost("/api/upload/{category}", async (string category, IFormFile file, IFileUploadService service) =>
{
    var validCategories = new[] { "models", "images", "videos" };
    if (!validCategories.Contains(category))
    {
        return Results.BadRequest(ApiResponse<FileUploadResult>.ErrorResult("Invalid category"));
    }

    var result = await service.UploadFileAsync(file, category);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("File Upload")
.WithSummary("Upload file")
.DisableAntiforgery();

app.MapDelete("/api/upload/{category}/{fileName}", async (string category, string fileName, IFileUploadService service) =>
{
    var result = await service.DeleteFileAsync(fileName, category);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("File Upload")
.WithSummary("Delete file");

// Analytics endpoints
app.MapPost("/api/analytics/track", async (AnalyticsEventCreateDto dto, IAnalyticsService service) =>
{
    var result = await service.TrackEventAsync(dto);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("Analytics")
.WithSummary("Track analytics event");

app.MapGet("/api/analytics/events", async (Guid? experienceId, int page, int pageSize, IAnalyticsService service) =>
{
    var result = await service.GetEventsAsync(experienceId, page, pageSize);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("Analytics")
.WithSummary("Get analytics events");

app.MapGet("/api/analytics/stats/{experienceId:guid}", async (Guid experienceId, IAnalyticsService service) =>
{
    var result = await service.GetEventStatsByExperienceAsync(experienceId);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
})
.WithTags("Analytics")
.WithSummary("Get event statistics for experience");

// Health check
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
.WithTags("Health")
.WithSummary("Health check");

app.Run();