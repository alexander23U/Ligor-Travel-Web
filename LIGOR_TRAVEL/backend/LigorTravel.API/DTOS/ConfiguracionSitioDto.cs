namespace LigorTravel.API.DTOs;

public class ConfiguracionSitioDto
{
    public string HeroEtiqueta { get; set; }
        = "Experiencias inolvidables";

    public string HeroTitulo { get; set; }
        = "Descubre el Perú";

    public string HeroSubtitulo { get; set; }
        = "con Ligor Travel";

    public string HeroDescripcion { get; set; }
        = string.Empty;

    public string? HeroImagen { get; set; }

    public string HeroBotonPrincipal { get; set; }
        = "Explorar paquetes";

    public string HeroBotonIA { get; set; }
        = "Planificar con Ligor IA";

    public bool HeroActivo { get; set; } = true;

    public string? HeroDisenoJson { get; set; }

    public string? Telefono { get; set; }

    public string? Whatsapp { get; set; }

    public string? Correo { get; set; }

    public string? Direccion { get; set; }

    public string? Facebook { get; set; }

    public string? Instagram { get; set; }

    public string? TikTok { get; set; }
}