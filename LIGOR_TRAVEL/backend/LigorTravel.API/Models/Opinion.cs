using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.Models
{
    public class Opinion
    {
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        public Usuario? Usuario { get; set; }

        [Required]
        public int PaqueteId { get; set; }

        public Paquete? Paquete { get; set; }

        [Required]
        [Range(1,5)]
        public int Calificacion { get; set; }

        [MaxLength(500)]
        public string? Comentario { get; set; }

        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }
}