namespace LigorTravel.API.DTOs;

public class DashboardResponseDto
{
    public int Usuarios { get; set; }
    public int UsuariosActivos { get; set; }
    public int ClientesNuevosMes { get; set; }

    public int Paquetes { get; set; }
    public int PaquetesActivos { get; set; }

    public int Reservas { get; set; }
    public int ReservasPendientes { get; set; }
    public int ReservasPagadas { get; set; }
    public int ReservasCanceladas { get; set; }

    public int Pagos { get; set; }
    public decimal IngresosTotales { get; set; }
    public decimal IngresosMes { get; set; }

    public int Opiniones { get; set; }

    public List<DashboardMesDto> VentasPorMes { get; set; } = new();
    public List<DashboardTopPaqueteDto> TopPaquetes { get; set; } = new();
    public List<DashboardReservaRecienteDto> UltimasReservas { get; set; } = new();
}

public class DashboardMesDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string Etiqueta { get; set; } = string.Empty;
    public decimal Ingresos { get; set; }
    public int Pagos { get; set; }
}

public class DashboardTopPaqueteDto
{
    public int PaqueteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Destino { get; set; } = string.Empty;
    public int Reservas { get; set; }
    public int Personas { get; set; }
    public decimal IngresosEstimados { get; set; }
}

public class DashboardReservaRecienteDto
{
    public int Id { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public string Paquete { get; set; } = string.Empty;
    public DateTime FechaReserva { get; set; }
    public int CantidadPersonas { get; set; }
    public decimal Total { get; set; }
    public string Estado { get; set; } = string.Empty;
}
