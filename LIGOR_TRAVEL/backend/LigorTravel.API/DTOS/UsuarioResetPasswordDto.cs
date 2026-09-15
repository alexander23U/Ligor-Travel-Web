using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs;

public class UsuarioResetPasswordDto
{
    [Required]
    [MinLength(8)]
    public string NuevaPassword { get; set; } = string.Empty;

    [Required]
    public string ConfirmarPassword { get; set; } = string.Empty;
}
