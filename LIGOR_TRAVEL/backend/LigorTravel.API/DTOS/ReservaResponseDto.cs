namespace LigorTravel.API.DTOs;

public class ReservaResponseDto
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public string UsuarioCorreo { get; set; } = string.Empty;
    public int PaqueteId { get; set; }
    public string Paquete { get; set; } = string.Empty;
    public DateTime FechaReserva { get; set; }
    public int CantidadPersonas { get; set; }
    public decimal Total { get; set; }
    public string Estado { get; set; } = string.Empty;
    public bool PagoRegistrado { get; set; }
    public string? MetodoPago { get; set; }
}
