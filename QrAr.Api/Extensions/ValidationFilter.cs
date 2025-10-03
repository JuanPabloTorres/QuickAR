using System.ComponentModel.DataAnnotations;
using QrAr.Api.DTOs;

namespace QrAr.Api.Extensions;

/// <summary>
/// Filtro de validación para endpoints de Minimal API
/// </summary>
public class ValidationFilter<T> : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var argument = context.Arguments.OfType<T>().FirstOrDefault();
        if (argument == null)
        {
            return Results.BadRequest(ApiResponse<object>.ErrorResult("Invalid request body"));
        }

        var validationContext = new ValidationContext(argument);
        var validationResults = new List<ValidationResult>();

        if (!Validator.TryValidateObject(argument, validationContext, validationResults, true))
        {
            var errors = validationResults.Select(r => r.ErrorMessage ?? "Validation error").ToArray();
            return Results.BadRequest(ApiResponse<object>.ErrorResult("Validation failed", errors));
        }

        return await next(context);
    }
}