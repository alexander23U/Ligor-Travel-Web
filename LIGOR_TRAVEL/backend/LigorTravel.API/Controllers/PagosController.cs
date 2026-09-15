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
public class PagosController : ControllerBase
{
private readonly AppDbContext _context;

public PagosController(AppDbContext context)
{
    _context = context;
}

[Authorize(Roles = "Administrador,Vendedor")]
[HttpGet]
public async Task<ActionResult<IEnumerable<PagoResponseDto>>> GetPagos()
{
var pagos = await _context.Pagos
.AsNoTracking()
.Where(p => p.Reserva != null)
.OrderByDescending(p => p.FechaPago)
.Select(p => new PagoResponseDto
{
Id = p.Id,
ReservaId = p.ReservaId,

        Cliente = p.Reserva!.Usuario != null
            ? p.Reserva.Usuario.Nombres + " " + p.Reserva.Usuario.Apellidos
            : "Cliente no disponible",

        Paquete = p.Reserva!.Paquete != null
            ? p.Reserva.Paquete.Nombre
            : "Paquete no disponible",

        Monto = p.Monto,
        MetodoPago = p.MetodoPago,
        FechaPago = p.FechaPago,
        Estado = p.Estado
    })
    .ToListAsync();

return Ok(pagos);

}


[HttpPost]
public async Task<ActionResult> RegistrarPago(PagoCreateDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.MetodoPago))
    {
        return BadRequest(new
        {
            mensaje = "El método de pago es obligatorio."
        });
    }

    var usuarioId = ObtenerIdUsuarioActual();

    if (usuarioId == null)
    {
        return Unauthorized(new
        {
            mensaje = "No se pudo identificar al usuario."
        });
    }

    var reserva = await _context.Reservas
        .Include(r => r.Pago)
        .FirstOrDefaultAsync(r => r.Id == dto.ReservaId);

    if (reserva == null)
    {
        return NotFound(new
        {
            mensaje = "Reserva no encontrada."
        });
    }

    var esPersonal =
        User.IsInRole("Administrador") ||
        User.IsInRole("Vendedor");

    if (!esPersonal && reserva.UsuarioId != usuarioId.Value)
    {
        return Forbid();
    }

    if (reserva.Pago != null)
    {
        return BadRequest(new
        {
            mensaje = "La reserva ya tiene un pago registrado."
        });
    }

    if (reserva.Estado == "Cancelada")
    {
        return BadRequest(new
        {
            mensaje = "No se puede pagar una reserva cancelada."
        });
    }

    if (reserva.Total <= 0)
    {
        return BadRequest(new
        {
            mensaje = "El monto de la reserva no es válido."
        });
    }

    var pago = new Pago
    {
        ReservaId = reserva.Id,
        Monto = reserva.Total,
        MetodoPago = dto.MetodoPago.Trim(),
        FechaPago = DateTime.UtcNow,
        Estado = "Pagado"
    };

    _context.Pagos.Add(pago);

    reserva.Estado = "Confirmada";

    await _context.SaveChangesAsync();

    return Ok(new
    {
        mensaje = "Pago registrado correctamente."
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
