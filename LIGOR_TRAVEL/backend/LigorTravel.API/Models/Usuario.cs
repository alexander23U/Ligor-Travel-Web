namespace LigorTravel.API.Models;

public class Usuario
{
    public int Id { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Rol { get; set; } = "Cliente";

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    public bool Estado { get; set; } = true;

    public ICollection<Reserva>? Reservas { get; set; }

    public ICollection<Opinion> Opiniones { get; set; } = new List<Opinion>();

    public ICollection<Mensaje> Mensajes { get; set; }
    = new List<Mensaje>();
}