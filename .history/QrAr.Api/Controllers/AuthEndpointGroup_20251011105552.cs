using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using QrAr.Api.Controllers.Base;
using QrAr.Api.DTOs;
using QrAr.Api.Services;

namespace QrAr.Api.Controllers;

/// <summary>
/// Endpoints para autenticación de usuarios
/// </summary>
public class AuthEndpointGroup : BaseEndpointGroup
{
    public override string RoutePrefix => "auth";
    public override string Tag => "Authentication";

    public override void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = CreateGroup(app);

        // POST /api/v1/auth/login
        group.MapPost("/login", LoginAsync)
            .WithName("Login")
            .WithSummary("Iniciar sesión con email y contraseña")
            .WithDescription("Autentica un usuario con sus credenciales y devuelve un token JWT")
            .Accepts<LoginDto>("application/json")
            .Produces<ApiResponse<AuthResponseDto>>(200)
            .Produces<ApiResponse<object>>(400)
            .AllowAnonymous();

        // POST /api/v1/auth/register
        group.MapPost("/register", RegisterAsync)
            .WithName("Register")
            .WithSummary("Registrar nuevo usuario")
            .WithDescription("Crea una nueva cuenta de usuario")
            .Accepts<RegisterDto>("application/json")
            .Produces<ApiResponse<AuthResponseDto>>(200)
            .Produces<ApiResponse<object>>(400)
            .AllowAnonymous();

        // GET /api/v1/auth/me
        group.MapGet("/me", GetCurrentUserAsync)
            .WithName("GetCurrentUser")
            .WithSummary("Obtener información del usuario actual")
            .WithDescription("Obtiene los datos del usuario autenticado")
            .Produces<ApiResponse<UserDto>>(200)
            .Produces<ApiResponse<object>>(401)
            .RequireAuthorization();

        // POST /api/v1/auth/change-password
        group.MapPost("/change-password", ChangePasswordAsync)
            .WithName("ChangePassword")
            .WithSummary("Cambiar contraseña")
            .WithDescription("Permite al usuario cambiar su contraseña actual")
            .Accepts<ChangePasswordDto>("application/json")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(401)
            .RequireAuthorization();

        // POST /api/v1/auth/logout
        group.MapPost("/logout", LogoutAsync)
            .WithName("Logout")
            .WithSummary("Cerrar sesión")
            .WithDescription("Invalida la sesión del usuario")
            .Produces<ApiResponse<bool>>(200)
            .Produces<ApiResponse<object>>(401)
            .RequireAuthorization();
    }

    /// <summary>
    /// Login user with email and password
    /// </summary>
    private static async Task<IResult> LoginAsync(
        LoginDto loginDto, 
        IAuthService authService)
    {
        var result = await authService.LoginAsync(loginDto);
        
        return result.Success 
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    private static async Task<IResult> RegisterAsync(
        RegisterDto registerDto, 
        IAuthService authService)
    {
        var result = await authService.RegisterAsync(registerDto);
        
        return result.Success 
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    private static async Task<IResult> GetCurrentUserAsync(
        ClaimsPrincipal user, 
        IAuthService authService)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var result = await authService.GetCurrentUserAsync(userId);
        
        return result.Success 
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }

    /// <summary>
    /// Change user password
    /// </summary>
    private static async Task<IResult> ChangePasswordAsync(
        ChangePasswordDto changePasswordDto,
        ClaimsPrincipal user, 
        IAuthService authService)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var result = await authService.ChangePasswordAsync(userId, changePasswordDto);
        
        return result.Success 
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }

    /// <summary>
    /// Logout user
    /// </summary>
    private static async Task<IResult> LogoutAsync(
        ClaimsPrincipal user, 
        IAuthService authService)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var result = await authService.LogoutAsync(userId);
        
        return result.Success 
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }
}