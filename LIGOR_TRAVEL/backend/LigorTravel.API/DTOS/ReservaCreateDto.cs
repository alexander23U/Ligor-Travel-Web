using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs;

public class ReservaCreateDto
{
    // Para Cliente se obtiene desde el JWT.
    // Administrador/Vendedor pueden indicar el cliente al registrar una reserva.
    public int? UsuarioId { get; set; }

    [Required]
    public int PaqueteId { get; set; }

    [Range(1, 100, ErrorMessage = "La cantidad de personas debe estar entre 1 y 100.")]
    public int CantidadPersonas { get; set; }
}
