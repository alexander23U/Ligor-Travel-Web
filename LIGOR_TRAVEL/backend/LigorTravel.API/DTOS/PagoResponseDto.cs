namespace LigorTravel.API.DTOs
{
    public class PagoResponseDto
    {
        public int Id { get; set; }

        public int ReservaId { get; set; }

        public string Cliente { get; set; } = string.Empty;

        public string Paquete { get; set; } = string.Empty;

        public decimal Monto { get; set; }

        public string MetodoPago { get; set; } = string.Empty;

        public DateTime FechaPago { get; set; }

        public string Estado { get; set; } = string.Empty;
    }
}