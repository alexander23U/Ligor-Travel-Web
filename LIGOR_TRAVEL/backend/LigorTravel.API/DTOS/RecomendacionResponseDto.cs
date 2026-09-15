namespace LigorTravel.API.DTOs
{
    public class RecomendacionResponseDto
    {
        public string DestinoRecomendado { get; set; } = string.Empty;
        public string Clima { get; set; } = string.Empty;
        public string Temporada { get; set; } = string.Empty;
        public string Motivo { get; set; } = string.Empty;
        public List<string> PaquetesSugeridos { get; set; } = new();
    }
}