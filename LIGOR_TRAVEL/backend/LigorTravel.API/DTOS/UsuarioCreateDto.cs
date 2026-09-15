namespace LigorTravel.API.DTOs;

public class UsuarioCreateDto
{
    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}