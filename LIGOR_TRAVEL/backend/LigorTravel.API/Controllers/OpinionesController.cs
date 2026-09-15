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
public class OpinionesController : ControllerBase
{
private readonly AppDbContext _context;

public OpinionesController(AppDbContext context)
{
    _context = context;
}

// Las opiniones pueden ser visibles públicamente.
[AllowAnonymous]
[HttpGet]
public async Task<ActionResult<IEnumerable<OpinionResponseDto>>> GetOpiniones()
{
    var opiniones = await ConsultaOpiniones().ToListAsync();
    return Ok(opiniones);
}

// Obtener opiniones de un paquete específico.
[AllowAnonymous]
[HttpGet("paquete/{paqueteId:int}")]
public async Task<ActionResult<IEnumerable<OpinionResponseDto>>> GetOpinionesPorPaquete(int paqueteId)
{
    var paqueteExiste = await _context.Paquetes
        .AnyAsync(p => p.Id == paqueteId);

    if (!paqueteExiste)
    {
        return NotFound(new
        {
            mensaje = "El paquete no existe."
        });
    }

    var opiniones = await ConsultaOpiniones()
        .Where(o => o.PaqueteId == paqueteId)
        .ToListAsync();

    return Ok(opiniones);
}

// Crear opinión.
// El usuario se obtiene desde el JWT y NO desde el frontend.
[Authorize]
[HttpPost]
public async Task<ActionResult> CrearOpinion(OpinionCreateDto dto)
{
    var usuarioId = ObtenerIdUsuarioActual();

    if (usuarioId == null)
    {
        return Unauthorized(new
        {
            mensaje = "No se pudo identificar al usuario autenticado."
        });
    }

    if (dto.Calificacion < 1 || dto.Calificacion > 5)
    {
        return BadRequest(new
        {
            mensaje = "La calificación debe estar entre 1 y 5."
        });
    }

    var paquete = await _context.Paquetes
        .FirstOrDefaultAsync(p => p.Id == dto.PaqueteId);

    if (paquete == null)
    {
        return NotFound(new
        {
            mensaje = "El paquete no existe."
        });
    }

    if (!paquete.Activo)
    {
        return BadRequest(new
        {
            mensaje = "No se puede opinar sobre un paquete inactivo."
        });
    }

    // Evita que un mismo usuario registre varias opiniones
    // para el mismo paquete.
    var yaExiste = await _context.Opiniones
        .AnyAsync(o =>
            o.UsuarioId == usuarioId.Value &&
            o.PaqueteId == dto.PaqueteId);

    if (yaExiste)
    {
        return BadRequest(new
        {
            mensaje = "Ya registraste una opinión para este paquete."
        });
    }

    var opinion = new Opinion
    {
        UsuarioId = usuarioId.Value,
        PaqueteId = dto.PaqueteId,
        Calificacion = dto.Calificacion,
        Comentario = string.IsNullOrWhiteSpace(dto.Comentario)
            ? null
            : dto.Comentario.Trim()
    };

    _context.Opiniones.Add(opinion);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        mensaje = "Opinión registrada correctamente.",
        id = opinion.Id
    });
}

// Eliminar opinión:
// solamente un Administrador puede hacerlo.
[Authorize(Roles = "Administrador")]
[HttpDelete("{id:int}")]
public async Task<ActionResult> EliminarOpinion(int id)
{
    var opinion = await _context.Opiniones
        .FirstOrDefaultAsync(o => o.Id == id);

    if (opinion == null)
    {
        return NotFound(new
        {
            mensaje = "Opinión no encontrada."
        });
    }

    _context.Opiniones.Remove(opinion);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        mensaje = "Opinión eliminada correctamente."
    });
}

private IQueryable<OpinionResponseDto> ConsultaOpiniones()
{
    return _context.Opiniones
        .AsNoTracking()
        .Include(o => o.Usuario)
        .Include(o => o.Paquete)
        .OrderByDescending(o => o.Fecha)
        .Select(o => new OpinionResponseDto
        {
            Id = o.Id,
            PaqueteId = o.PaqueteId,
            Usuario = o.Usuario!.Nombres + " " + o.Usuario!.Apellidos,
            Paquete = o.Paquete!.Nombre,
            Calificacion = o.Calificacion,
            Comentario = o.Comentario,
            Fecha = o.Fecha
        });
}

private int? ObtenerIdUsuarioActual()
{
    var valor = User.FindFirstValue(ClaimTypes.NameIdentifier);

    return int.TryParse(valor, out var id)
        ? id
        : null;
}

}
