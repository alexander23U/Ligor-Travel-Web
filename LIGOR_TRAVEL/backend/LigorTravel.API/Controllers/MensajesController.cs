using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;
using LigorTravel.API.Models;

namespace LigorTravel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MensajesController : ControllerBase
{
    private readonly AppDbContext _context;
    public MensajesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MensajeResponseDto>>> GetMensajes()
    {
        var usuarioId = ObtenerIdUsuarioActual();
        if (usuarioId == null) return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });

        var consulta = _context.Mensajes.Include(m => m.Usuario).OrderBy(m => m.Fecha).AsQueryable();
        if (!PuedeVerTodos()) consulta = consulta.Where(m => m.UsuarioId == usuarioId.Value);

        var mensajes = await consulta.Select(m => new MensajeResponseDto
        {
            Id = m.Id,
            Usuario = m.Usuario.Nombres + " " + m.Usuario.Apellidos,
            Texto = m.Texto,
            Fecha = m.Fecha
        }).ToListAsync();

        return Ok(mensajes);
    }

    [HttpPost]
    public async Task<ActionResult> EnviarMensaje(MensajeCreateDto dto)
    {
        var usuarioId = ObtenerIdUsuarioActual();
        if (usuarioId == null) return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });

        if (string.IsNullOrWhiteSpace(dto.Texto))
            return BadRequest(new { mensaje = "El mensaje no puede estar vacío" });

        if (dto.Texto.Trim().Length > 2000)
            return BadRequest(new { mensaje = "El mensaje no puede superar 2000 caracteres." });

        _context.Mensajes.Add(new Mensaje
        {
            UsuarioId = usuarioId.Value,
            Texto = dto.Texto.Trim(),
            Fecha = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Mensaje enviado correctamente" });
    }

    private int? ObtenerIdUsuarioActual()
    {
        var valor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(valor, out var id) ? id : null;
    }

    private bool PuedeVerTodos() => User.IsInRole("Administrador") || User.IsInRole("Vendedor");
}
