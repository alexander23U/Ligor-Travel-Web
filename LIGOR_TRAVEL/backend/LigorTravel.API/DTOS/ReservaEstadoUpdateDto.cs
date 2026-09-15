using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs;

public class ReservaEstadoUpdateDto
{
    [Required]
    public string Estado { get; set; } = string.Empty;
}
