using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs;

public class MensajeCreateDto
{
    [Required]
    [MaxLength(2000)]
    public string Texto { get; set; } = string.Empty;
}
