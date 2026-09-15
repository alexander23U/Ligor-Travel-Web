using System.ComponentModel.DataAnnotations;

namespace LigorTravel.API.Models
{
    public class Pago
    {
        public int Id { get; set; }

        [Required]
        public int ReservaId { get; set; }

        public Reserva? Reserva { get; set; }

        [Required]
        public decimal Monto { get; set; }

        [Required]
        [MaxLength(50)]
        public string MetodoPago { get; set; } = string.Empty;

        public DateTime FechaPago { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(30)]
        public string Estado { get; set; } = "Pagado";
    }
}