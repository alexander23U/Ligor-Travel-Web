using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LigorTravel.API.Models
{
    public class Reserva
    {
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }

        [Required]
        public int PaqueteId { get; set; }

        [ForeignKey("PaqueteId")]
        public Paquete? Paquete { get; set; }

        [Required]
        public DateTime FechaReserva { get; set; } = DateTime.Now;

        [Required]
        public int CantidadPersonas { get; set; }

        [Required]
        public decimal Total { get; set; }

        [Required]
        public string Estado { get; set; } = "Pendiente";

        public Pago? Pago { get; set; }
    }
}