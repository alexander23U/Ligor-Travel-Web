using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs;

public class PagoCreateDto
{
    [Required]
    public int ReservaId { get; set; }

    [Required]
    [MaxLength(50)]
    public string MetodoPago { get; set; } = string.Empty;
}
