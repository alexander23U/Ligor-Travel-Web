namespace LigorTravel.API.Models;

public class ConfiguracionSitio
{
    public int Id { get; set; }

    public string HeroEtiqueta { get; set; }
        = "Experiencias inolvidables";

    public string HeroTitulo { get; set; }
        = "Descubre el Perú";

    public string HeroSubtitulo { get; set; }
        = "con Ligor Travel";

    public string HeroDescripcion { get; set; }
        = "Encuentra destinos increíbles, paquetes turísticos y experiencias diseñadas para crear recuerdos únicos.";

    public string? HeroImagen { get; set; }

    public string HeroBotonPrincipal { get; set; }
        = "Explorar paquetes";

    public string HeroBotonIA { get; set; }
        = "Planificar con Ligor IA";

    public bool HeroActivo { get; set; } = true;

    // Diseño libre de la portada creado desde el editor visual.
    public string? HeroDisenoJson { get; set; }

    // Estos campos ya los dejamos preparados
    // para la siguiente parte del administrador.

    public string? Telefono { get; set; }

    public string? Whatsapp { get; set; }

    public string? Correo { get; set; }

    public string? Direccion { get; set; }

    public string? Facebook { get; set; }

    public string? Instagram { get; set; }

    public string? TikTok { get; set; }
}