using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using QrAr.Api.Data;
using QrAr.Api.DTOs;
using QrAr.Api.Models;

namespace QrAr.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(AppDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

                if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    return ApiResponse<AuthResponseDto>.ErrorResult("Invalid credentials");
                }

                if (!user.IsActive)
                {
                    return ApiResponse<AuthResponseDto>.ErrorResult("Account is disabled");
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = GenerateJwtToken(user);
                var expiresAt = DateTime.UtcNow.AddHours(24); // 24 hours

                var response = new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = MapToUserDto(user)
                };

                return ApiResponse<AuthResponseDto>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
                return ApiResponse<AuthResponseDto>.ErrorResult("An error occurred during login");
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == registerDto.Email.ToLower() ||
                                             u.Username.ToLower() == registerDto.Username.ToLower());

                if (existingUser != null)
                {
                    return ApiResponse<AuthResponseDto>.ErrorResult("User with this email or username already exists");
                }

                // Create new user
                var user = new User
                {
                    Username = registerDto.Username,
                    Email = registerDto.Email,
                    PasswordHash = HashPassword(registerDto.Password),
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    IsActive = true,
                    IsEmailConfirmed = false,
                    Role = "User"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = GenerateJwtToken(user);
                var expiresAt = DateTime.UtcNow.AddHours(24);

                var response = new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = MapToUserDto(user)
                };

                return ApiResponse<AuthResponseDto>.SuccessResult(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", registerDto.Email);
                return ApiResponse<AuthResponseDto>.ErrorResult("An error occurred during registration");
            }
        }

        public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return ApiResponse<UserDto>.ErrorResult("User not found");
                }

                return ApiResponse<UserDto>.SuccessResult(MapToUserDto(user));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user: {UserId}", userId);
                return ApiResponse<UserDto>.ErrorResult("An error occurred while getting user information");
            }
        }

        public async Task<ApiResponse<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileDto updateProfileDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return ApiResponse<UserDto>.ErrorResult("User not found");
                }

                // Check if username is being changed and if it's already taken
                if (!string.IsNullOrWhiteSpace(updateProfileDto.Username) &&
                    updateProfileDto.Username != user.Username)
                {
                    var existingUsername = await _context.Users
                        .AnyAsync(u => u.Username.ToLower() == updateProfileDto.Username.ToLower() && u.Id != userId);

                    if (existingUsername)
                    {
                        return ApiResponse<UserDto>.ErrorResult("Username is already taken");
                    }

                    user.Username = updateProfileDto.Username;
                }

                // Check if email is being changed and if it's already taken
                if (!string.IsNullOrWhiteSpace(updateProfileDto.Email) &&
                    updateProfileDto.Email != user.Email)
                {
                    var existingEmail = await _context.Users
                        .AnyAsync(u => u.Email.ToLower() == updateProfileDto.Email.ToLower() && u.Id != userId);

                    if (existingEmail)
                    {
                        return ApiResponse<UserDto>.ErrorResult("Email is already taken");
                    }

                    user.Email = updateProfileDto.Email;
                    user.IsEmailConfirmed = false; // Reset email confirmation when email changes
                }

                // Update other fields
                if (updateProfileDto.FirstName != null)
                {
                    user.FirstName = updateProfileDto.FirstName;
                }

                if (updateProfileDto.LastName != null)
                {
                    user.LastName = updateProfileDto.LastName;
                }

                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ApiResponse<UserDto>.SuccessResult(MapToUserDto(user));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile for user: {UserId}", userId);
                return ApiResponse<UserDto>.ErrorResult("An error occurred while updating profile");
            }
        }

        public async Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return ApiResponse<bool>.ErrorResult("User not found");
                }

                if (!VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
                {
                    return ApiResponse<bool>.ErrorResult("Current password is incorrect");
                }

                user.PasswordHash = HashPassword(changePasswordDto.NewPassword);
                await _context.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("An error occurred while changing password");
            }
        }

        public async Task<ApiResponse<bool>> LogoutAsync(Guid userId)
        {
            try
            {
                // For now, just return success since we're using JWT (stateless)
                // In the future, you could implement token blacklisting
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout for user: {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("An error occurred during logout");
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? "your-super-secret-key-here");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim("FirstName", user.FirstName ?? ""),
                    new Claim("LastName", user.LastName ?? "")
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = jwtSettings["Issuer"] ?? "QrArApi",
                Audience = jwtSettings["Audience"] ?? "QrArClient"
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static string HashPassword(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[16];
            rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(32);

            var hashBytes = new byte[48];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 32);

            return Convert.ToBase64String(hashBytes);
        }

        private static bool VerifyPassword(string password, string hash)
        {
            var hashBytes = Convert.FromBase64String(hash);
            var salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(32);

            for (int i = 0; i < 32; i++)
            {
                if (hashBytes[i + 16] != computedHash[i])
                    return false;
            }

            return true;
        }

        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                IsActive = user.IsActive,
                IsEmailConfirmed = user.IsEmailConfirmed,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
