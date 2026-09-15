using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.Models
{
    public class Mensaje
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }

        public Usuario Usuario { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string Texto { get; set; } = string.Empty;

        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }
}