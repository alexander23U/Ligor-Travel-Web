using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs;

public class UsuarioAdminUpdateDto
{
    [Required]
    [MaxLength(100)]
    public string Nombres { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Apellidos { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Correo { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Telefono { get; set; } = string.Empty;

    [Required]
    public string Rol { get; set; } = "Cliente";

    public bool Estado { get; set; } = true;
}
