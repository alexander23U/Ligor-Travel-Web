using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs;

public class OpinionCreateDto
{
    [Required]
    public int PaqueteId { get; set; }

    [Range(1, 5)]
    public int Calificacion { get; set; }

    [MaxLength(1000)]
    public string? Comentario { get; set; }
}
