using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.Models
{
    public class Paquete
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Destino { get; set; } = string.Empty;

        [Required]
        public decimal Precio { get; set; }

        [Required]
        public int DuracionDias { get; set; }

        [Required]
        public int Cupos { get; set; }

        public string? Imagen { get; set; }

        // Información ampliada para la página de detalle del tour
        public string? Horarios { get; set; }
        public string? PuntoRecojo { get; set; }
        public string? QueViviras { get; set; }
        public string? Itinerario { get; set; }
        public string? Incluye { get; set; }
        public string? NoIncluye { get; set; }
        public string? Recomendaciones { get; set; }


        // =====================================================
        // CATEGORÍA / TIPO DE EXPERIENCIA
        // =====================================================

        [Required]
        [MaxLength(50)]
        public string Categoria { get; set; } = "Cultura";


        // =====================================================
        // ESTADO
        // =====================================================

        public bool Activo { get; set; } = true;


        // =====================================================
        // RELACIONES
        // =====================================================

        public ICollection<Reserva>? Reservas { get; set; }

        public ICollection<Opinion> Opiniones { get; set; }
            = new List<Opinion>();
    }
}