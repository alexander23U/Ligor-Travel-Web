namespace LigorTravel.API.DTOs;

public class CambiarPasswordDto
{
    public string PasswordActual { get; set; } = string.Empty;

    public string NuevaPassword { get; set; } = string.Empty;

    public string ConfirmarPassword { get; set; } = string.Empty;
}