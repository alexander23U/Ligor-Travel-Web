namespace LigorTravel.API.DTOs
{
    public class PaqueteResponseDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public string Destino { get; set; } = string.Empty;

        public decimal Precio { get; set; }

        public int DuracionDias { get; set; }

        public int Cupos { get; set; }

        public string? Imagen { get; set; }

        public string? Horarios { get; set; }
        public string? PuntoRecojo { get; set; }
        public string? QueViviras { get; set; }
        public string? Itinerario { get; set; }
        public string? Incluye { get; set; }
        public string? NoIncluye { get; set; }
        public string? Recomendaciones { get; set; }

        // NUEVO
        public string Categoria { get; set; } = string.Empty;

        public bool Activo { get; set; }
    }
}