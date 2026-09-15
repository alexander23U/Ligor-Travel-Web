using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;
using LigorTravel.API.Models;

namespace LigorTravel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaquetesController : ControllerBase
{
    private readonly AppDbContext _context;

    private static readonly string[] CategoriasPermitidas =
    {
        "Aventura",
        "Playas",
        "Naturaleza",
        "Cultura",
        "Gastronomía",
        "Fotografía"
    };

    public PaquetesController(AppDbContext context)
    {
        _context = context;
    }


    // =====================================================
    // GET: api/Paquetes
    // PÚBLICO
    // =====================================================

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaqueteResponseDto>>> GetPaquetes()
    {
        var paquetes = await _context.Paquetes
            .AsNoTracking()
            .OrderByDescending(p => p.Id)
            .Select(p => new PaqueteResponseDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Destino = p.Destino,
                Precio = p.Precio,
                DuracionDias = p.DuracionDias,
                Cupos = p.Cupos,
                Imagen = p.Imagen,
                Horarios = p.Horarios,
                PuntoRecojo = p.PuntoRecojo,
                QueViviras = p.QueViviras,
                Itinerario = p.Itinerario,
                Incluye = p.Incluye,
                NoIncluye = p.NoIncluye,
                Recomendaciones = p.Recomendaciones,

                // NUEVO
                Categoria = p.Categoria,

                Activo = p.Activo
            })
            .ToListAsync();

        return Ok(paquetes);
    }


    // =====================================================
    // GET: api/Paquetes/5
    // PÚBLICO
    // =====================================================

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaqueteResponseDto>> GetPaquete(int id)
    {
        var paquete = await _context.Paquetes
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new PaqueteResponseDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Destino = p.Destino,
                Precio = p.Precio,
                DuracionDias = p.DuracionDias,
                Cupos = p.Cupos,
                Imagen = p.Imagen,
                Horarios = p.Horarios,
                PuntoRecojo = p.PuntoRecojo,
                QueViviras = p.QueViviras,
                Itinerario = p.Itinerario,
                Incluye = p.Incluye,
                NoIncluye = p.NoIncluye,
                Recomendaciones = p.Recomendaciones,

                // NUEVO
                Categoria = p.Categoria,

                Activo = p.Activo
            })
            .FirstOrDefaultAsync();

        if (paquete == null)
        {
            return NotFound(new
            {
                mensaje = "Paquete no encontrado"
            });
        }

        return Ok(paquete);
    }


    // =====================================================
    // POST: api/Paquetes
    // ADMINISTRADOR O VENDEDOR
    // =====================================================

    [Authorize(Roles = "Administrador,Vendedor")]
    [HttpPost]
    public async Task<ActionResult> CrearPaquete(
        PaqueteCreateDto dto
    )
    {
        var validacion =
            ValidarPaquete(dto);

        if (validacion != null)
        {
            return validacion;
        }


        var categoriaNormalizada =
            ObtenerCategoriaValida(
                dto.Categoria
            );


        if (categoriaNormalizada == null)
        {
            return BadRequest(new
            {
                mensaje =
                    "La categoría seleccionada no es válida."
            });
        }


        var paquete = new Paquete
        {
            Nombre =
                dto.Nombre.Trim(),

            Descripcion =
                dto.Descripcion?.Trim()
                ?? string.Empty,

            Destino =
                dto.Destino.Trim(),

            Precio =
                dto.Precio,

            DuracionDias =
                dto.DuracionDias,

            Cupos =
                dto.Cupos,

            Imagen =
                string.IsNullOrWhiteSpace(
                    dto.Imagen
                )
                    ? null
                    : dto.Imagen.Trim(),

            Horarios = LimpiarOpcional(dto.Horarios),
            PuntoRecojo = LimpiarOpcional(dto.PuntoRecojo),
            QueViviras = LimpiarOpcional(dto.QueViviras),
            Itinerario = LimpiarOpcional(dto.Itinerario),
            Incluye = LimpiarOpcional(dto.Incluye),
            NoIncluye = LimpiarOpcional(dto.NoIncluye),
            Recomendaciones = LimpiarOpcional(dto.Recomendaciones),

            // NUEVO
            Categoria =
                categoriaNormalizada,

            Activo =
                dto.Activo
        };


        _context.Paquetes.Add(
            paquete
        );

        await _context.SaveChangesAsync();


        return Ok(new
        {
            mensaje =
                "Paquete creado correctamente",

            paquete =
                ConvertirAResponseDto(
                    paquete
                )
        });
    }


    // =====================================================
    // PUT: api/Paquetes/5
    // ADMINISTRADOR O VENDEDOR
    // =====================================================

    [Authorize(Roles = "Administrador,Vendedor")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> ActualizarPaquete(
        int id,
        PaqueteCreateDto dto
    )
    {
        var paquete =
            await _context.Paquetes
                .FindAsync(id);


        if (paquete == null)
        {
            return NotFound(new
            {
                mensaje =
                    "Paquete no encontrado"
            });
        }


        var validacion =
            ValidarPaquete(dto);

        if (validacion != null)
        {
            return validacion;
        }


        var categoriaNormalizada =
            ObtenerCategoriaValida(
                dto.Categoria
            );


        if (categoriaNormalizada == null)
        {
            return BadRequest(new
            {
                mensaje =
                    "La categoría seleccionada no es válida."
            });
        }


        paquete.Nombre =
            dto.Nombre.Trim();

        paquete.Descripcion =
            dto.Descripcion?.Trim()
            ?? string.Empty;

        paquete.Destino =
            dto.Destino.Trim();

        paquete.Precio =
            dto.Precio;

        paquete.DuracionDias =
            dto.DuracionDias;

        paquete.Cupos =
            dto.Cupos;

        paquete.Imagen =
            string.IsNullOrWhiteSpace(
                dto.Imagen
            )
                ? null
                : dto.Imagen.Trim();

        paquete.Horarios = LimpiarOpcional(dto.Horarios);
        paquete.PuntoRecojo = LimpiarOpcional(dto.PuntoRecojo);
        paquete.QueViviras = LimpiarOpcional(dto.QueViviras);
        paquete.Itinerario = LimpiarOpcional(dto.Itinerario);
        paquete.Incluye = LimpiarOpcional(dto.Incluye);
        paquete.NoIncluye = LimpiarOpcional(dto.NoIncluye);
        paquete.Recomendaciones = LimpiarOpcional(dto.Recomendaciones);

        // NUEVO
        paquete.Categoria =
            categoriaNormalizada;

        paquete.Activo =
            dto.Activo;


        await _context.SaveChangesAsync();


        return Ok(new
        {
            mensaje =
                "Paquete actualizado correctamente",

            paquete =
                ConvertirAResponseDto(
                    paquete
                )
        });
    }


    // =====================================================
    // DELETE: api/Paquetes/5
    // ADMINISTRADOR O VENDEDOR
    // =====================================================

    [Authorize(Roles = "Administrador,Vendedor")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> EliminarPaquete(
        int id
    )
    {
        var paquete =
            await _context.Paquetes
                .FindAsync(id);


        if (paquete == null)
        {
            return NotFound(new
            {
                mensaje =
                    "Paquete no encontrado"
            });
        }


        _context.Paquetes.Remove(
            paquete
        );

        await _context.SaveChangesAsync();


        return Ok(new
        {
            mensaje =
                "Paquete eliminado correctamente"
        });
    }


    // =====================================================
    // POST: api/Paquetes/subir-imagen
    // SOLO ADMINISTRADOR
    // =====================================================

    [Authorize(Roles = "Administrador")]
    [HttpPost("subir-imagen")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<ActionResult> SubirImagen(
        IFormFile archivo
    )
    {
        if (
            archivo == null ||
            archivo.Length == 0
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "Debes seleccionar una imagen"
            });
        }


        var extensionesPermitidas =
            new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };


        var extension =
            Path
                .GetExtension(
                    archivo.FileName
                )
                .ToLowerInvariant();


        if (
            !extensionesPermitidas
                .Contains(extension)
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "Solo se permiten imágenes JPG, JPEG, PNG o WEBP"
            });
        }


        const long tamanioMaximo =
            5 * 1024 * 1024;


        if (
            archivo.Length >
            tamanioMaximo
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "La imagen no debe superar los 5 MB"
            });
        }


        var tiposPermitidos =
            new[]
            {
                "image/jpeg",
                "image/png",
                "image/webp"
            };


        if (
            !tiposPermitidos.Contains(
                archivo.ContentType
                    .ToLowerInvariant()
            )
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "El archivo seleccionado no es una imagen válida"
            });
        }


        var carpetaUploads =
            Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads"
            );


        Directory.CreateDirectory(
            carpetaUploads
        );


        var nombreArchivo =
            $"{Guid.NewGuid():N}{extension}";


        var rutaCompleta =
            Path.Combine(
                carpetaUploads,
                nombreArchivo
            );


        await using (
            var stream = new FileStream(
                rutaCompleta,
                FileMode.Create
            )
        )
        {
            await archivo.CopyToAsync(
                stream
            );
        }


        return Ok(new
        {
            mensaje =
                "Imagen subida correctamente",

            nombreArchivo,

            url =
                $"/uploads/{nombreArchivo}"
        });
    }


    // =====================================================
    // VALIDAR PAQUETE
    // =====================================================

    private ActionResult? ValidarPaquete(
        PaqueteCreateDto dto
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                dto.Nombre
            )
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "El nombre del paquete es obligatorio"
            });
        }


        if (
            string.IsNullOrWhiteSpace(
                dto.Descripcion
            )
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "La descripción del paquete es obligatoria"
            });
        }


        if (
            string.IsNullOrWhiteSpace(
                dto.Destino
            )
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "El destino es obligatorio"
            });
        }


        if (
            string.IsNullOrWhiteSpace(
                dto.Categoria
            )
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "Selecciona un tipo de experiencia"
            });
        }


        if (dto.Precio < 0)
        {
            return BadRequest(new
            {
                mensaje =
                    "El precio no puede ser negativo"
            });
        }


        if (
            dto.DuracionDias <= 0
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "La duración debe ser mayor a 0 días"
            });
        }


        if (dto.Cupos < 0)
        {
            return BadRequest(new
            {
                mensaje =
                    "Los cupos no pueden ser negativos"
            });
        }


        return null;
    }


    // =====================================================
    // NORMALIZAR CATEGORÍA
    // =====================================================

    private static string?
        ObtenerCategoriaValida(
            string? categoria
        )
    {
        if (
            string.IsNullOrWhiteSpace(
                categoria
            )
        )
        {
            return null;
        }


        return CategoriasPermitidas
            .FirstOrDefault(
                c =>
                    string.Equals(
                        c,
                        categoria.Trim(),
                        StringComparison
                            .OrdinalIgnoreCase
                    )
            );
    }


    // =====================================================
    // CONVERTIR RESPUESTA
    // =====================================================

    private static PaqueteResponseDto
        ConvertirAResponseDto(
            Paquete paquete
        )
    {
        return new PaqueteResponseDto
        {
            Id =
                paquete.Id,

            Nombre =
                paquete.Nombre,

            Descripcion =
                paquete.Descripcion,

            Destino =
                paquete.Destino,

            Precio =
                paquete.Precio,

            DuracionDias =
                paquete.DuracionDias,

            Cupos =
                paquete.Cupos,

            Imagen =
                paquete.Imagen,

            Horarios = paquete.Horarios,
            PuntoRecojo = paquete.PuntoRecojo,
            QueViviras = paquete.QueViviras,
            Itinerario = paquete.Itinerario,
            Incluye = paquete.Incluye,
            NoIncluye = paquete.NoIncluye,
            Recomendaciones = paquete.Recomendaciones,

            Categoria =
                paquete.Categoria,

            Activo =
                paquete.Activo
        };
    }

    private static string? LimpiarOpcional(string? valor)
        => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

}