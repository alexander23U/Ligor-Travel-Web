namespace LigorTravel.API.DTOs
{
    public class MensajeResponseDto
    {
        public int Id { get; set; }

        public string Usuario { get; set; } = string.Empty;

        public string Texto { get; set; } = string.Empty;

        public DateTime Fecha { get; set; }
    }
}