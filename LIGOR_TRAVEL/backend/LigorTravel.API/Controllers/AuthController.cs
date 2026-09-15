using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;

namespace LigorTravel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var correo = dto.Correo?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(correo) || string.IsNullOrWhiteSpace(dto.Password))
            return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });

        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
            return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });

        if (!usuario.Estado)
            return Unauthorized(new { mensaje = "Tu cuenta está desactivada. Contacta con Ligor Travel." });

        var jwtKey = _configuration["Jwt:Key"];
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
            throw new InvalidOperationException("La configuración JWT está incompleta.");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nombres),
            new Claim(ClaimTypes.Email, usuario.Correo),
            new Claim(ClaimTypes.Role, usuario.Rol)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            usuario = new
            {
                usuario.Id,
                usuario.Nombres,
                usuario.Apellidos,
                usuario.Correo,
                usuario.Rol
            }
        });
    }

    // Recuperación de emergencia para el administrador.
    // Se habilita únicamente cuando existe la clave LIGOR_ADMIN_BOOTSTRAP_KEY
    // en User Secrets o en una variable de entorno.
    [HttpPost("bootstrap-admin")]
    public async Task<IActionResult> BootstrapAdmin([FromHeader(Name = "X-Admin-Bootstrap-Key")] string? bootstrapKey, [FromBody] BootstrapAdminDto dto)
    {
        var configuredKey = _configuration["AdminBootstrap:Key"];

        if (string.IsNullOrWhiteSpace(configuredKey) ||
            string.IsNullOrWhiteSpace(bootstrapKey) ||
            !CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(configuredKey),
                Encoding.UTF8.GetBytes(bootstrapKey)))
        {
            return Unauthorized(new { mensaje = "Operación no autorizada." });
        }

        if (string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { mensaje = "Correo y contraseña son obligatorios." });

        if (dto.Password.Length < 8)
            return BadRequest(new { mensaje = "La contraseña debe tener al menos 8 caracteres." });

        var correo = dto.Correo.Trim().ToLowerInvariant();
        var admin = await _context.Usuarios.FirstOrDefaultAsync(u => u.Rol == "Administrador");

        if (admin == null)
        {
            admin = new Models.Usuario
            {
                Nombres = string.IsNullOrWhiteSpace(dto.Nombres) ? "Administrador" : dto.Nombres.Trim(),
                Apellidos = string.IsNullOrWhiteSpace(dto.Apellidos) ? "Ligor Travel" : dto.Apellidos.Trim(),
                Correo = correo,
                Telefono = dto.Telefono?.Trim() ?? string.Empty,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Rol = "Administrador",
                Estado = true,
                FechaRegistro = DateTime.UtcNow
            };
            _context.Usuarios.Add(admin);
        }
        else
        {
            var correoEnUso = await _context.Usuarios.AnyAsync(u => u.Id != admin.Id && u.Correo.ToLower() == correo);
            if (correoEnUso)
                return BadRequest(new { mensaje = "El correo ya está siendo utilizado por otro usuario." });

            admin.Correo = correo;
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            admin.Estado = true;
        }

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Administrador creado/restablecido correctamente." });
    }
}

public class BootstrapAdminDto
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
