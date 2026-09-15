using System;

namespace LigorTravel.API.DTOs
{
public class OpinionResponseDto
{
public int Id { get; set; }

    public int PaqueteId { get; set; }

    public string Usuario { get; set; } = "";

    public string Paquete { get; set; } = "";

    public int Calificacion { get; set; }

    public string? Comentario { get; set; }

    public DateTime Fecha { get; set; }
}
}