namespace LigorTravel.API.DTOs;

public class UsuarioResponseDto
{
    public int Id { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string Rol { get; set; } = string.Empty;

    public bool Estado { get; set; }

    public DateTime FechaRegistro { get; set; }
}
