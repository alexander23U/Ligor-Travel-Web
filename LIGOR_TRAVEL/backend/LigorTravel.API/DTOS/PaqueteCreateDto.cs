using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.DTOs
{
    public class PaqueteCreateDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public string Destino { get; set; } = string.Empty;

        [Required]
        public decimal Precio { get; set; }

        [Required]
        public int DuracionDias { get; set; }

        [Required]
        public int Cupos { get; set; }

        public string? Imagen { get; set; }

        public string? Horarios { get; set; }
        public string? PuntoRecojo { get; set; }
        public string? QueViviras { get; set; }
        public string? Itinerario { get; set; }
        public string? Incluye { get; set; }
        public string? NoIncluye { get; set; }
        public string? Recomendaciones { get; set; }


        // =====================================================
        // NUEVO
        // =====================================================

        [Required]
        [MaxLength(50)]
        public string Categoria { get; set; } = "Cultura";


        public bool Activo { get; set; } = true;
    }
}