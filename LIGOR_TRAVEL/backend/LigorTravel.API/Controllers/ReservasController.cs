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
public class ReservasController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservasController(AppDbContext context) => _context = context;

    [Authorize(Roles = "Administrador,Vendedor")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservaResponseDto>>> GetReservas()
    {
        var reservas = await _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Paquete)
            .Include(r => r.Pago)
            .OrderByDescending(r => r.FechaReserva)
            .ToListAsync();

        return Ok(reservas.Select(Mapear).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservaResponseDto>> GetReserva(int id)
    {
        var reserva = await _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Paquete)
            .Include(r => r.Pago)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reserva == null)
            return NotFound(new { mensaje = "Reserva no encontrada" });

        if (!PuedeGestionarTodasLasReservas() && reserva.UsuarioId != ObtenerIdUsuarioActual())
            return Forbid();

        return Ok(Mapear(reserva));
    }

    [Authorize(Roles = "Cliente,Administrador,Vendedor")]
    [HttpPost]
    public async Task<ActionResult> CrearReserva(ReservaCreateDto dto)
    {
        if (dto.CantidadPersonas < 1)
            return BadRequest(new { mensaje = "La cantidad de personas debe ser mayor que cero." });

        var idUsuarioActual = ObtenerIdUsuarioActual();
        if (idUsuarioActual == null)
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });

        var esPersonal = PuedeGestionarTodasLasReservas();
        var usuarioId = esPersonal ? dto.UsuarioId ?? idUsuarioActual.Value : idUsuarioActual.Value;

        var usuario = await _context.Usuarios.FindAsync(usuarioId);
        if (usuario == null || !usuario.Estado)
            return NotFound(new { mensaje = "El usuario de la reserva no existe o está desactivado." });

        var paquete = await _context.Paquetes.FindAsync(dto.PaqueteId);
        if (paquete == null)
            return NotFound(new { mensaje = "Paquete no encontrado" });

        if (!paquete.Activo)
            return BadRequest(new { mensaje = "El paquete no está disponible" });

        if (dto.CantidadPersonas > paquete.Cupos)
            return BadRequest(new { mensaje = "No hay suficientes cupos disponibles" });

        var total = paquete.Precio * dto.CantidadPersonas;
        var reserva = new Reserva
        {
            UsuarioId = usuarioId,
            PaqueteId = paquete.Id,
            FechaReserva = DateTime.UtcNow,
            CantidadPersonas = dto.CantidadPersonas,
            Total = total,
            Estado = "Pendiente"
        };

        paquete.Cupos -= dto.CantidadPersonas;
        _context.Reservas.Add(reserva);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Reserva realizada correctamente", total });
    }

    [Authorize(Roles = "Administrador,Vendedor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> ActualizarReserva(int id, ReservaCreateDto dto)
    {
        if (dto.CantidadPersonas < 1)
            return BadRequest(new { mensaje = "La cantidad de personas debe ser mayor que cero." });

        var reserva = await _context.Reservas
            .Include(r => r.Paquete)
            .Include(r => r.Pago)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reserva == null)
            return NotFound(new { mensaje = "Reserva no encontrada" });

        if (reserva.Pago != null)
            return BadRequest(new { mensaje = "No se pueden cambiar cliente, paquete o cantidad después de registrar el pago." });

        if (string.Equals(reserva.Estado, "Cancelada", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { mensaje = "Reactiva la reserva antes de modificar sus datos." });

        if (dto.UsuarioId.HasValue)
        {
            var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId.Value);
            if (usuario == null || !usuario.Estado)
                return BadRequest(new { mensaje = "El cliente seleccionado no existe o está desactivado." });
        }

        var nuevoPaquete = await _context.Paquetes.FindAsync(dto.PaqueteId);
        if (nuevoPaquete == null)
            return NotFound(new { mensaje = "Paquete no encontrado" });

        if (!nuevoPaquete.Activo)
            return BadRequest(new { mensaje = "El paquete no está disponible" });

        var paqueteAnterior = reserva.Paquete!;
        paqueteAnterior.Cupos += reserva.CantidadPersonas;

        if (dto.CantidadPersonas > nuevoPaquete.Cupos)
        {
            paqueteAnterior.Cupos -= reserva.CantidadPersonas;
            return BadRequest(new { mensaje = "No hay suficientes cupos disponibles para la nueva cantidad." });
        }

        reserva.UsuarioId = dto.UsuarioId ?? reserva.UsuarioId;
        reserva.PaqueteId = nuevoPaquete.Id;
        reserva.CantidadPersonas = dto.CantidadPersonas;
        reserva.Total = nuevoPaquete.Precio * dto.CantidadPersonas;
        nuevoPaquete.Cupos -= dto.CantidadPersonas;

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Reserva actualizada correctamente" });
    }

    [Authorize(Roles = "Administrador,Vendedor")]
    [HttpPut("{id:int}/estado")]
    public async Task<ActionResult> ActualizarEstadoReserva(int id, ReservaEstadoUpdateDto dto)
    {
        var nuevoEstado = NormalizarEstado(dto.Estado);
        if (nuevoEstado == null)
            return BadRequest(new { mensaje = "El estado debe ser Pendiente, Confirmada o Cancelada." });

        var reserva = await _context.Reservas
            .Include(r => r.Paquete)
            .Include(r => r.Pago)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reserva == null)
            return NotFound(new { mensaje = "Reserva no encontrada." });

        var estadoActual = NormalizarEstado(reserva.Estado) ?? "Pendiente";
        if (estadoActual == nuevoEstado)
            return Ok(new { mensaje = "La reserva ya tiene ese estado." });

        if (reserva.Pago != null && nuevoEstado != "Confirmada")
            return BadRequest(new { mensaje = "Una reserva con pago registrado debe permanecer confirmada." });

        if (estadoActual == "Cancelada" && nuevoEstado != "Cancelada")
        {
            if (reserva.Paquete == null || !reserva.Paquete.Activo)
                return BadRequest(new { mensaje = "El paquete ya no está disponible para reactivar la reserva." });

            if (reserva.CantidadPersonas > reserva.Paquete.Cupos)
                return BadRequest(new { mensaje = "No hay cupos suficientes para reactivar la reserva." });

            reserva.Paquete.Cupos -= reserva.CantidadPersonas;
        }
        else if (estadoActual != "Cancelada" && nuevoEstado == "Cancelada")
        {
            if (reserva.Paquete != null)
                reserva.Paquete.Cupos += reserva.CantidadPersonas;
        }

        reserva.Estado = nuevoEstado;
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = $"Reserva marcada como {nuevoEstado.ToLowerInvariant()}." });
    }

    [Authorize(Roles = "Administrador,Vendedor")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> EliminarReserva(int id)
    {
        var reserva = await _context.Reservas
            .Include(r => r.Paquete)
            .Include(r => r.Pago)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reserva == null)
            return NotFound(new { mensaje = "Reserva no encontrada" });

        if (reserva.Pago != null)
            return BadRequest(new { mensaje = "No se puede eliminar una reserva con un pago registrado." });

        if (!string.Equals(reserva.Estado, "Cancelada", StringComparison.OrdinalIgnoreCase) && reserva.Paquete != null)
            reserva.Paquete.Cupos += reserva.CantidadPersonas;

        _context.Reservas.Remove(reserva);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Reserva eliminada correctamente." });
    }

    private int? ObtenerIdUsuarioActual()
    {
        var valor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(valor, out var id) ? id : null;
    }

    private bool PuedeGestionarTodasLasReservas() =>
        User.IsInRole("Administrador") || User.IsInRole("Vendedor");

    private static string? NormalizarEstado(string? estado)
    {
        return estado?.Trim().ToLowerInvariant() switch
        {
            "pendiente" => "Pendiente",
            "confirmada" => "Confirmada",
            "cancelada" => "Cancelada",
            _ => null
        };
    }

    private static ReservaResponseDto Mapear(Reserva r) => new()
    {
        Id = r.Id,
        UsuarioId = r.UsuarioId,
        Usuario = r.Usuario != null ? r.Usuario.Nombres + " " + r.Usuario.Apellidos : "Cliente no disponible",
        UsuarioCorreo = r.Usuario?.Correo ?? string.Empty,
        PaqueteId = r.PaqueteId,
        Paquete = r.Paquete?.Nombre ?? "Paquete no disponible",
        FechaReserva = r.FechaReserva,
        CantidadPersonas = r.CantidadPersonas,
        Total = r.Total,
        Estado = r.Estado,
        PagoRegistrado = r.Pago != null,
        MetodoPago = r.Pago?.MetodoPago
    };
}
