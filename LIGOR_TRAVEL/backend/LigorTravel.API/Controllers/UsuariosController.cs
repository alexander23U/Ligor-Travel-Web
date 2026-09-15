using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;
using LigorTravel.API.Models;

namespace LigorTravel.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET: api/Usuarios
    // SOLO ADMINISTRADOR
    // =====================================================
    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResponseDto>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios
            .AsNoTracking()
            .OrderByDescending(u => u.FechaRegistro)
            .Select(u => new UsuarioResponseDto
            {
                Id = u.Id,
                Nombres = u.Nombres,
                Apellidos = u.Apellidos,
                Correo = u.Correo,
                Telefono = u.Telefono,
                Rol = u.Rol,
                Estado = u.Estado,
                FechaRegistro = u.FechaRegistro
            })
            .ToListAsync();

        return Ok(usuarios);
    }

    // =====================================================
    // GET: api/Usuarios/5
    // SOLO ADMINISTRADOR
    // =====================================================
    [Authorize(Roles = "Administrador")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioResponseDto>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        return Ok(MapearUsuario(usuario));
    }

    // =====================================================
    // POST: api/Usuarios
    // REGISTRO PÚBLICO DE CLIENTE
    // =====================================================
    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult> CrearUsuario(UsuarioCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombres) ||
            string.IsNullOrWhiteSpace(dto.Apellidos) ||
            string.IsNullOrWhiteSpace(dto.Correo) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { mensaje = "Completa todos los campos obligatorios." });
        }

        if (dto.Password.Length < 6)
        {
            return BadRequest(new { mensaje = "La contraseña debe tener al menos 6 caracteres." });
        }

        var correo = NormalizarCorreo(dto.Correo);

        if (await CorreoExiste(correo))
        {
            return BadRequest(new { mensaje = "El correo ya está registrado." });
        }

        var usuario = new Usuario
        {
            Nombres = dto.Nombres.Trim(),
            Apellidos = dto.Apellidos.Trim(),
            Correo = correo,
            Telefono = dto.Telefono?.Trim() ?? string.Empty,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Rol = "Cliente",
            Estado = true,
            FechaRegistro = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Usuario registrado correctamente." });
    }

    // =====================================================
    // POST: api/Usuarios/admin
    // CREAR USUARIO DESDE EL PANEL ADMINISTRATIVO
    // =====================================================
    [Authorize(Roles = "Administrador")]
    [HttpPost("admin")]
    public async Task<ActionResult> CrearUsuarioAdmin(UsuarioAdminCreateDto dto)
    {
        var rol = NormalizarRol(dto.Rol);

        if (rol == null)
        {
            return BadRequest(new { mensaje = "El rol seleccionado no es válido." });
        }

        var correo = NormalizarCorreo(dto.Correo);

        if (await CorreoExiste(correo))
        {
            return BadRequest(new { mensaje = "El correo ya está siendo utilizado por otro usuario." });
        }

        var usuario = new Usuario
        {
            Nombres = dto.Nombres.Trim(),
            Apellidos = dto.Apellidos.Trim(),
            Correo = correo,
            Telefono = dto.Telefono?.Trim() ?? string.Empty,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Rol = rol,
            Estado = true,
            FechaRegistro = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Usuario creado correctamente.",
            usuario = MapearUsuario(usuario)
        });
    }

    // =====================================================
    // PUT: api/Usuarios/5
    // EDITAR USUARIO DESDE EL PANEL ADMINISTRATIVO
    // =====================================================
    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> ActualizarUsuarioAdmin(int id, UsuarioAdminUpdateDto dto)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        var rol = NormalizarRol(dto.Rol);

        if (rol == null)
        {
            return BadRequest(new { mensaje = "El rol seleccionado no es válido." });
        }

        var correo = NormalizarCorreo(dto.Correo);

        if (await CorreoExiste(correo, usuario.Id))
        {
            return BadRequest(new { mensaje = "El correo ya está siendo utilizado por otro usuario." });
        }

        var idActual = ObtenerIdUsuarioActual();
        var esMismoUsuario = idActual.HasValue && idActual.Value == usuario.Id;

        if (esMismoUsuario && rol != "Administrador")
        {
            return BadRequest(new { mensaje = "No puedes quitarte a ti mismo el rol de Administrador." });
        }

        if (esMismoUsuario && !dto.Estado)
        {
            return BadRequest(new { mensaje = "No puedes desactivar tu propia cuenta de administrador." });
        }

        if (usuario.Rol == "Administrador" && rol != "Administrador")
        {
            var hayOtroAdministradorActivo = await _context.Usuarios.AnyAsync(u =>
                u.Id != usuario.Id &&
                u.Rol == "Administrador" &&
                u.Estado);

            if (!hayOtroAdministradorActivo)
            {
                return BadRequest(new { mensaje = "Debe existir al menos un administrador activo." });
            }
        }

        if (usuario.Rol == "Administrador" && usuario.Estado && !dto.Estado)
        {
            var hayOtroAdministradorActivo = await _context.Usuarios.AnyAsync(u =>
                u.Id != usuario.Id &&
                u.Rol == "Administrador" &&
                u.Estado);

            if (!hayOtroAdministradorActivo)
            {
                return BadRequest(new { mensaje = "No puedes desactivar al único administrador activo." });
            }
        }

        usuario.Nombres = dto.Nombres.Trim();
        usuario.Apellidos = dto.Apellidos.Trim();
        usuario.Correo = correo;
        usuario.Telefono = dto.Telefono?.Trim() ?? string.Empty;
        usuario.Rol = rol;
        usuario.Estado = dto.Estado;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Usuario actualizado correctamente.",
            usuario = MapearUsuario(usuario)
        });
    }

    // =====================================================
    // PUT: api/Usuarios/5/estado
    // ACTIVAR O DESACTIVAR SIN ELIMINAR
    // =====================================================
    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}/estado")]
    public async Task<ActionResult> CambiarEstadoUsuario(int id)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        var idActual = ObtenerIdUsuarioActual();

        if (idActual == usuario.Id && usuario.Estado)
        {
            return BadRequest(new { mensaje = "No puedes desactivar tu propia cuenta." });
        }

        if (usuario.Rol == "Administrador" && usuario.Estado)
        {
            var hayOtroAdministradorActivo = await _context.Usuarios.AnyAsync(u =>
                u.Id != usuario.Id &&
                u.Rol == "Administrador" &&
                u.Estado);

            if (!hayOtroAdministradorActivo)
            {
                return BadRequest(new { mensaje = "No puedes desactivar al único administrador activo." });
            }
        }

        usuario.Estado = !usuario.Estado;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = usuario.Estado
                ? "Usuario activado correctamente."
                : "Usuario desactivado correctamente.",
            estado = usuario.Estado
        });
    }

    // =====================================================
    // PUT: api/Usuarios/5/reset-password
    // RESTABLECER CONTRASEÑA DESDE ADMINISTRACIÓN
    // =====================================================
    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}/reset-password")]
    public async Task<ActionResult> RestablecerPassword(int id, UsuarioResetPasswordDto dto)
    {
        if (dto.NuevaPassword != dto.ConfirmarPassword)
        {
            return BadRequest(new { mensaje = "Las contraseñas no coinciden." });
        }

        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Contraseña restablecida correctamente." });
    }

    // =====================================================
    // GET: api/Usuarios/mi-cuenta
    // =====================================================
    [HttpGet("mi-cuenta")]
    public async Task<ActionResult<UsuarioResponseDto>> ObtenerMiCuenta()
    {
        var idUsuario = ObtenerIdUsuarioActual();

        if (idUsuario == null)
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        }

        var usuario = await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        return Ok(MapearUsuario(usuario));
    }

    // =====================================================
    // PUT: api/Usuarios/mi-cuenta
    // =====================================================
    [HttpPut("mi-cuenta")]
    public async Task<ActionResult> ActualizarMiCuenta(UsuarioActualizarCuentaDto dto)
    {
        var idUsuario = ObtenerIdUsuarioActual();

        if (idUsuario == null)
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        }

        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        if (string.IsNullOrWhiteSpace(dto.Nombres) ||
            string.IsNullOrWhiteSpace(dto.Apellidos) ||
            string.IsNullOrWhiteSpace(dto.Correo))
        {
            return BadRequest(new { mensaje = "Nombres, apellidos y correo son obligatorios." });
        }

        var correo = NormalizarCorreo(dto.Correo);

        if (await CorreoExiste(correo, usuario.Id))
        {
            return BadRequest(new { mensaje = "El correo ya está siendo utilizado por otro usuario." });
        }

        usuario.Nombres = dto.Nombres.Trim();
        usuario.Apellidos = dto.Apellidos.Trim();
        usuario.Correo = correo;
        usuario.Telefono = dto.Telefono?.Trim() ?? string.Empty;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Tus datos fueron actualizados correctamente.",
            usuario = MapearUsuario(usuario)
        });
    }

    // =====================================================
    // PUT: api/Usuarios/cambiar-password
    // =====================================================
    [HttpPut("cambiar-password")]
    public async Task<ActionResult> CambiarPassword(CambiarPasswordDto dto)
    {
        var idUsuario = ObtenerIdUsuarioActual();

        if (idUsuario == null)
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        }

        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        if (string.IsNullOrWhiteSpace(dto.PasswordActual) ||
            !BCrypt.Net.BCrypt.Verify(dto.PasswordActual, usuario.PasswordHash))
        {
            return BadRequest(new { mensaje = "La contraseña actual es incorrecta." });
        }

        if (string.IsNullOrWhiteSpace(dto.NuevaPassword) || dto.NuevaPassword.Length < 6)
        {
            return BadRequest(new { mensaje = "La nueva contraseña debe tener al menos 6 caracteres." });
        }

        if (dto.NuevaPassword != dto.ConfirmarPassword)
        {
            return BadRequest(new { mensaje = "Las nuevas contraseñas no coinciden." });
        }

        if (BCrypt.Net.BCrypt.Verify(dto.NuevaPassword, usuario.PasswordHash))
        {
            return BadRequest(new { mensaje = "La nueva contraseña debe ser diferente a la actual." });
        }

        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Tu contraseña fue cambiada correctamente." });
    }

    // =====================================================
    // DELETE: api/Usuarios/5
    // SE DESHABILITA LA ELIMINACIÓN FÍSICA DESDE LA API
    // =====================================================
    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public ActionResult EliminarUsuario(int id)
    {
        return BadRequest(new
        {
            mensaje = "Por seguridad, los usuarios no se eliminan. Usa la opción Activar/Desactivar."
        });
    }

    private int? ObtenerIdUsuarioActual()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    private async Task<bool> CorreoExiste(string correo, int? excluirId = null)
    {
        return await _context.Usuarios.AnyAsync(u =>
            u.Correo.ToLower() == correo &&
            (!excluirId.HasValue || u.Id != excluirId.Value));
    }

    private static string NormalizarCorreo(string correo)
    {
        return correo.Trim().ToLowerInvariant();
    }

    private static string? NormalizarRol(string rol)
    {
        var valor = rol.Trim().ToLowerInvariant();

        return valor switch
        {
            "cliente" => "Cliente",
            "vendedor" => "Vendedor",
            "administrador" => "Administrador",
            _ => null
        };
    }

    private static UsuarioResponseDto MapearUsuario(Usuario usuario)
    {
        return new UsuarioResponseDto
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            Correo = usuario.Correo,
            Telefono = usuario.Telefono,
            Rol = usuario.Rol,
            Estado = usuario.Estado,
            FechaRegistro = usuario.FechaRegistro
        };
    }
}
