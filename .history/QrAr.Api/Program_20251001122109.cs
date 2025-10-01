using Microsoft.EntityFrameworkCore;
using QrAr.Api.Data;
using QrAr.Api.DTOs;
using QrAr.Api.Services;

var builder = WebApplication.CreateBuilder(args);

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
    });
    app.UseCors("AllowSwagger"); // More permissive for development
}
else
{
    app.UseCors("AllowFrontend"); // Restrictive for production
}

app.UseHttpsRedirection();
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

app.Run();