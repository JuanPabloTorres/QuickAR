using System.Net;
using System.Text.Json;
using QrAr.Api.DTOs;

namespace QrAr.Api.Middleware;

/// <summary>
/// Middleware para manejo global de excepciones
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while processing the request");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = exception switch
        {
            ArgumentNullException => CreateResponse(HttpStatusCode.BadRequest, "Invalid request data"),
            ArgumentException => CreateResponse(HttpStatusCode.BadRequest, exception.Message),
            UnauthorizedAccessException => CreateResponse(HttpStatusCode.Unauthorized, "Unauthorized access"),
            FileNotFoundException => CreateResponse(HttpStatusCode.NotFound, "Resource not found"),
            InvalidOperationException => CreateResponse(HttpStatusCode.BadRequest, exception.Message),
            _ => CreateResponse(HttpStatusCode.InternalServerError, "An internal server error occurred")
        };

        context.Response.StatusCode = (int)response.StatusCode;
        
        var jsonResponse = JsonSerializer.Serialize(response.ApiResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }

    private static (HttpStatusCode StatusCode, ApiResponse<object> ApiResponse) CreateResponse(
        HttpStatusCode statusCode, 
        string message)
    {
        var apiResponse = ApiResponse<object>.ErrorResult(message);
        return (statusCode, apiResponse);
    }
}