using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using QrAr.Api.Data;
using QrAr.Api.DTOs;
using QrAr.Api.Services;

var builder = Web// Health check
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
.WithTags("Health")
.WithSummary("Health check");

app.MapControllers();

// In development, automatically open Swagger in browser with correct URL
if (app.Environment.IsDevelopment())
{
    Task.Run(async () =>
    {
        await Task.Delay(2000); // Wait for the server to start
        try
        {
            var url = "http://localhost:5001/swagger";
            var psi = new System.Diagnostics.ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            };
            System.Diagnostics.Process.Start(psi);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Could not open browser: {ex.Message}");
        }
    });
}

app.Run();ion.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ??
                     "Data Source=qr_ar.db"));

// Register services
builder.Services.AddScoped<IExperienceService, ExperienceService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

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
    c.SwaggerDoc("v1", new() { Title = "QR AR API", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QR AR API v1");
        c.RoutePrefix = "swagger"; // Set the route prefix for Swagger UI
    });
    app.UseCors("AllowSwagger"); // More permissive for development
}
else
{
    app.UseCors("AllowFrontend"); // Restrictive for production
}

// Commented out for development to allow HTTP traffic
// app.UseHttpsRedirection();

// First add default static files middleware for wwwroot
app.UseStaticFiles();

// Configure specialized static file serving with proper MIME types for 3D assets
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".glb"] = "model/gltf-binary";
provider.Mappings[".gltf"] = "model/gltf+json";
provider.Mappings[".usdz"] = "model/vnd.usdz+zip";

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads")),
    RequestPath = "/uploads",
    ContentTypeProvider = provider,
    OnPrepareResponse = ctx =>
    {
        // Add CORS headers to static files
        ctx.Context.Response.Headers["Access-Control-Allow-Origin"] = "*";
        ctx.Context.Response.Headers["Access-Control-Allow-Methods"] = "GET";
        ctx.Context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type";
    }
});

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
}

// API Routes

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

app.MapControllers();

app.Run();