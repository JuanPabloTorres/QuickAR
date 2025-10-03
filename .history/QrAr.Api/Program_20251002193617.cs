using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
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

// Add controllers for traditional MVC endpoints (if needed)
builder.Services.AddControllers();

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

// API Routes - Register endpoint groups from controllers
QrAr.Api.Controllers.ExperiencesController.MapExperienceEndpoints(app);
QrAr.Api.Controllers.FileUploadController.MapFileUploadEndpoints(app);
QrAr.Api.Controllers.AnalyticsController.MapAnalyticsEndpoints(app);
QrAr.Api.Controllers.HealthController.MapHealthEndpoints(app);

app.MapControllers();

app.Run();