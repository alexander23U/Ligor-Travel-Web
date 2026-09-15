using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;

namespace LigorTravel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecomendacionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RecomendacionesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<RecomendacionResponseDto>> Recomendar(
        RecomendacionRequestDto dto)
    {
        string mes = dto.Mes.ToLower();
        string preferencia = dto.Preferencia.ToLower();

        string destino = "Cusco";
        string clima = "Clima templado y seco";
        string temporada = "Temporada recomendada";
        string motivo = "Cusco es una excelente opción para turismo cultural y aventura.";

        if (mes.Contains("enero") || mes.Contains("febrero") || mes.Contains("marzo"))
        {
            destino = "Máncora";
            clima = "Cálido y soleado";
            temporada = "Temporada ideal para playa";
            motivo = "Entre enero y marzo las playas del norte son muy recomendadas.";
        }
        else if (mes.Contains("abril") || mes.Contains("mayo") || mes.Contains("junio") ||
                 mes.Contains("julio") || mes.Contains("agosto") || mes.Contains("septiembre"))
        {
            destino = "Cusco";
            clima = "Seco y fresco";
            temporada = "Temporada seca";
            motivo = "Es una buena temporada para visitar Machu Picchu, Valle Sagrado y la Montaña de 7 Colores.";
        }
        else if (mes.Contains("octubre") || mes.Contains("noviembre"))
        {
            destino = "Arequipa";
            clima = "Templado";
            temporada = "Buena temporada para turismo cultural";
            motivo = "Arequipa y el Valle del Colca son buenas opciones antes de la temporada de lluvias.";
        }
        else if (mes.Contains("diciembre"))
        {
            destino = "Paracas";
            clima = "Cálido y agradable";
            temporada = "Temporada de verano";
            motivo = "Paracas es recomendable para disfrutar playa, islas y actividades al aire libre.";
        }

        if (preferencia.Contains("playa"))
        {
            destino = "Máncora";
            clima = "Cálido";
            motivo = "Según tu preferencia por playa, Máncora es una buena recomendación.";
        }
        else if (preferencia.Contains("cultura"))
        {
            destino = "Cusco";
            motivo = "Según tu preferencia cultural, Cusco es ideal por su historia y atractivos turísticos.";
        }
        else if (preferencia.Contains("naturaleza"))
        {
            destino = "Arequipa";
            motivo = "Según tu preferencia por naturaleza, el Valle del Colca es una buena opción.";
        }

        var paquetes = await _context.Paquetes
            .Where(p => p.Activo &&
                        p.Destino.ToLower().Contains(destino.ToLower()) &&
                        p.Precio <= dto.Presupuesto)
            .Select(p => p.Nombre)
            .ToListAsync();

        var respuesta = new RecomendacionResponseDto
        {
            DestinoRecomendado = destino,
            Clima = clima,
            Temporada = temporada,
            Motivo = motivo,
            PaquetesSugeridos = paquetes
        };

        return Ok(respuesta);
    }
}