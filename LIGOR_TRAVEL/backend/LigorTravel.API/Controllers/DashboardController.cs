using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;

namespace LigorTravel.API.Controllers;

[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponseDto>> GetDashboard()
    {
        var ahora = DateTime.UtcNow;
        var inicioMes = new DateTime(ahora.Year, ahora.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var inicioSiguienteMes = inicioMes.AddMonths(1);
        var inicioGrafico = inicioMes.AddMonths(-5);

        var pagosUltimosMeses = await _context.Pagos
            .AsNoTracking()
            .Where(p => p.FechaPago >= inicioGrafico && p.Estado == "Pagado")
            .Select(p => new
            {
                p.FechaPago,
                p.Monto
            })
            .ToListAsync();

        var cultura = new CultureInfo("es-PE");
        var ventasPorMes = Enumerable.Range(0, 6)
            .Select(indice => inicioGrafico.AddMonths(indice))
            .Select(fecha =>
            {
                var pagosMes = pagosUltimosMeses
                    .Where(p => p.FechaPago.Year == fecha.Year && p.FechaPago.Month == fecha.Month)
                    .ToList();

                return new DashboardMesDto
                {
                    Anio = fecha.Year,
                    Mes = fecha.Month,
                    Etiqueta = cultura.DateTimeFormat.GetAbbreviatedMonthName(fecha.Month)
                        .TrimEnd('.')
                        .ToUpperInvariant(),
                    Ingresos = pagosMes.Sum(p => p.Monto),
                    Pagos = pagosMes.Count
                };
            })
            .ToList();

        var topPaquetesDatos = await _context.Reservas
            .AsNoTracking()
            .Where(r => r.Paquete != null && r.Estado != "Cancelada")
            .Select(r => new
            {
                r.PaqueteId,
                Nombre = r.Paquete!.Nombre,
                Destino = r.Paquete.Destino,
                r.CantidadPersonas,
                r.Total
            })
            .ToListAsync();

        var topPaquetes = topPaquetesDatos
            .GroupBy(r => new { r.PaqueteId, r.Nombre, r.Destino })
            .Select(grupo => new DashboardTopPaqueteDto
            {
                PaqueteId = grupo.Key.PaqueteId,
                Nombre = grupo.Key.Nombre,
                Destino = grupo.Key.Destino,
                Reservas = grupo.Count(),
                Personas = grupo.Sum(r => r.CantidadPersonas),
                IngresosEstimados = grupo.Sum(r => r.Total)
            })
            .OrderByDescending(p => p.Reservas)
            .ThenByDescending(p => p.IngresosEstimados)
            .Take(5)
            .ToList();

        var ultimasReservas = await _context.Reservas
            .AsNoTracking()
            .Where(r => r.Usuario != null && r.Paquete != null)
            .OrderByDescending(r => r.FechaReserva)
            .Take(6)
            .Select(r => new DashboardReservaRecienteDto
            {
                Id = r.Id,
                Cliente = r.Usuario!.Nombres + " " + r.Usuario.Apellidos,
                Paquete = r.Paquete!.Nombre,
                FechaReserva = r.FechaReserva,
                CantidadPersonas = r.CantidadPersonas,
                Total = r.Total,
                Estado = r.Estado
            })
            .ToListAsync();

        var dashboard = new DashboardResponseDto
        {
            Usuarios = await _context.Usuarios.CountAsync(),
            UsuariosActivos = await _context.Usuarios.CountAsync(u => u.Estado),
            ClientesNuevosMes = await _context.Usuarios.CountAsync(u =>
                u.Rol == "Cliente" &&
                u.FechaRegistro >= inicioMes &&
                u.FechaRegistro < inicioSiguienteMes),

            Paquetes = await _context.Paquetes.CountAsync(),
            PaquetesActivos = await _context.Paquetes.CountAsync(p => p.Activo),

            Reservas = await _context.Reservas.CountAsync(),
            ReservasPendientes = await _context.Reservas.CountAsync(r => r.Estado == "Pendiente"),
            ReservasPagadas = await _context.Reservas.CountAsync(r => r.Estado == "Confirmada"),
            ReservasCanceladas = await _context.Reservas.CountAsync(r => r.Estado == "Cancelada"),

            Pagos = await _context.Pagos.CountAsync(p => p.Estado == "Pagado"),
            IngresosTotales = await _context.Pagos
                .Where(p => p.Estado == "Pagado")
                .SumAsync(p => (decimal?)p.Monto) ?? 0,
            IngresosMes = await _context.Pagos
                .Where(p =>
                    p.Estado == "Pagado" &&
                    p.FechaPago >= inicioMes &&
                    p.FechaPago < inicioSiguienteMes)
                .SumAsync(p => (decimal?)p.Monto) ?? 0,

            Opiniones = await _context.Opiniones.CountAsync(),
            VentasPorMes = ventasPorMes,
            TopPaquetes = topPaquetes,
            UltimasReservas = ultimasReservas
        };

        return Ok(dashboard);
    }
}
