namespace LigorTravel.API.DTOs
{
    public class RecomendacionRequestDto
    {
        public string Mes { get; set; } = string.Empty;
        public string Preferencia { get; set; } = string.Empty;
        public decimal Presupuesto { get; set; }
    }
}