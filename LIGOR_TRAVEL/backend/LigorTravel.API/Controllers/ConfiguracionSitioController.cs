using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;
using LigorTravel.API.Models;

namespace LigorTravel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfiguracionSitioController : ControllerBase
{
    private readonly AppDbContext _context;

    public ConfiguracionSitioController(
        AppDbContext context
    )
    {
        _context = context;
    }


    // =====================================================
    // GET: api/ConfiguracionSitio
    // PÚBLICO
    // =====================================================

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult> Obtener()
    {
        var configuracion =
            await ObtenerOCrearConfiguracion();

        return Ok(configuracion);
    }


    // =====================================================
    // PUT: api/ConfiguracionSitio
    // SOLO ADMINISTRADOR
    // =====================================================

    [Authorize(Roles = "Administrador")]
    [HttpPut]
    public async Task<ActionResult> Actualizar(
        ConfiguracionSitioDto dto
    )
    {
        var configuracion =
            await ObtenerOCrearConfiguracion();


        configuracion.HeroEtiqueta =
            (dto.HeroEtiqueta ?? string.Empty)
                .Trim();


        configuracion.HeroTitulo =
            (dto.HeroTitulo ?? string.Empty)
                .Trim();


        configuracion.HeroSubtitulo =
            (dto.HeroSubtitulo ?? string.Empty)
                .Trim();


        configuracion.HeroDescripcion =
            (dto.HeroDescripcion ?? string.Empty)
                .Trim();


        configuracion.HeroBotonPrincipal =
            (dto.HeroBotonPrincipal ?? string.Empty)
                .Trim();


        configuracion.HeroBotonIA =
            (dto.HeroBotonIA ?? string.Empty)
                .Trim();


        configuracion.HeroActivo =
            dto.HeroActivo;


        configuracion.HeroDisenoJson =
            LimpiarTexto(dto.HeroDisenoJson);


        /*
         * IMPORTANTE:
         *
         * HeroImagen NO se modifica aquí.
         *
         * Se cambia únicamente mediante:
         *
         * POST   /api/ConfiguracionSitio/subir-hero
         * DELETE /api/ConfiguracionSitio/hero
         *
         * Así evitamos que un PUT de textos
         * vuelva accidentalmente HeroImagen a null.
         */


        configuracion.Telefono =
            LimpiarTexto(
                dto.Telefono
            );


        configuracion.Whatsapp =
            LimpiarTexto(
                dto.Whatsapp
            );


        configuracion.Correo =
            LimpiarTexto(
                dto.Correo
            );


        configuracion.Direccion =
            LimpiarTexto(
                dto.Direccion
            );


        configuracion.Facebook =
            LimpiarTexto(
                dto.Facebook
            );


        configuracion.Instagram =
            LimpiarTexto(
                dto.Instagram
            );


        configuracion.TikTok =
            LimpiarTexto(
                dto.TikTok
            );


        await _context.SaveChangesAsync();


        return Ok(new
        {
            mensaje =
                "Configuración actualizada correctamente.",

            configuracion
        });
    }


    // =====================================================
    // POST: api/ConfiguracionSitio/subir-hero
    // SOLO ADMINISTRADOR
    // =====================================================

    [Authorize(Roles = "Administrador")]
    [HttpPost("subir-hero")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(8 * 1024 * 1024)]
    public async Task<ActionResult> SubirHero(
        IFormFile archivo
    )
    {
        // =================================================
        // VALIDAR ARCHIVO
        // =================================================

        if (
            archivo == null ||
            archivo.Length == 0
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "Debes seleccionar una imagen."
            });
        }


        // =================================================
        // VALIDAR TAMAÑO
        // =================================================

        const long tamanioMaximo =
            8 * 1024 * 1024;


        if (
            archivo.Length >
            tamanioMaximo
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "La imagen no puede superar los 8 MB."
            });
        }


        // =================================================
        // VALIDAR EXTENSIÓN
        // =================================================

        var extensionesPermitidas =
            new HashSet<string>(
                StringComparer.OrdinalIgnoreCase
            )
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };


        var extension =
            Path.GetExtension(
                archivo.FileName
            );


        if (
            string.IsNullOrWhiteSpace(
                extension
            ) ||
            !extensionesPermitidas.Contains(
                extension
            )
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "Solo se permiten imágenes JPG, JPEG, PNG o WEBP."
            });
        }


        // =================================================
        // VALIDAR CONTENT TYPE
        // =================================================

        var tiposPermitidos =
            new HashSet<string>(
                StringComparer.OrdinalIgnoreCase
            )
            {
                "image/jpeg",
                "image/png",
                "image/webp"
            };


        if (
            string.IsNullOrWhiteSpace(
                archivo.ContentType
            ) ||
            !tiposPermitidos.Contains(
                archivo.ContentType
            )
        )
        {
            return BadRequest(new
            {
                mensaje =
                    "El archivo seleccionado no es una imagen válida."
            });
        }


        // =================================================
        // CARPETA DE DESTINO
        // =================================================

        var carpeta =
            Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "sitio"
            );


        Directory.CreateDirectory(
            carpeta
        );


        // =================================================
        // NOMBRE ÚNICO
        // =================================================

        var extensionNormalizada =
            extension
                .ToLowerInvariant();


        var nombreArchivo =
            $"hero-{Guid.NewGuid():N}{extensionNormalizada}";


        var rutaFisica =
            Path.Combine(
                carpeta,
                nombreArchivo
            );


        // =================================================
        // GUARDAR ARCHIVO
        // =================================================

        await using (
            var stream =
                new FileStream(
                    rutaFisica,
                    FileMode.Create
                )
        )
        {
            await archivo.CopyToAsync(
                stream
            );
        }


        // =================================================
        // ACTUALIZAR CONFIGURACIÓN
        // =================================================

        var configuracion =
            await ObtenerOCrearConfiguracion();


        var imagenAnterior =
            configuracion.HeroImagen;


        var nuevaRuta =
            $"/uploads/sitio/{nombreArchivo}";


        configuracion.HeroImagen =
            nuevaRuta;


        try
        {
            await _context.SaveChangesAsync();
        }
        catch
        {
            // Si falla PostgreSQL,
            // eliminamos el archivo recién creado.

            if (
                System.IO.File.Exists(
                    rutaFisica
                )
            )
            {
                System.IO.File.Delete(
                    rutaFisica
                );
            }


            throw;
        }


        // =================================================
        // ELIMINAR IMAGEN ANTERIOR
        // =================================================

        if (
            !string.IsNullOrWhiteSpace(
                imagenAnterior
            ) &&
            !string.Equals(
                imagenAnterior,
                nuevaRuta,
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            EliminarArchivoHero(
                imagenAnterior
            );
        }


        // =================================================
        // VERIFICAR LO GUARDADO
        // =================================================

        var configuracionGuardada =
            await _context
                .ConfiguracionesSitio
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    c =>
                        c.Id ==
                        configuracion.Id
                );


        return Ok(new
        {
            mensaje =
                "Imagen principal actualizada correctamente.",

            imagen =
                configuracionGuardada?.HeroImagen,

            url =
                configuracionGuardada?.HeroImagen,

            configuracion =
                configuracionGuardada
        });
    }


    // =====================================================
    // DELETE: api/ConfiguracionSitio/hero
    // SOLO ADMINISTRADOR
    // =====================================================

    [Authorize(Roles = "Administrador")]
    [HttpDelete("hero")]
    public async Task<ActionResult> EliminarHero()
    {
        var configuracion =
            await ObtenerOCrearConfiguracion();


        var imagenAnterior =
            configuracion.HeroImagen;


        configuracion.HeroImagen =
            null;


        await _context.SaveChangesAsync();


        /*
         * Primero guardamos null en PostgreSQL.
         * Después eliminamos el archivo físico.
         */

        if (
            !string.IsNullOrWhiteSpace(
                imagenAnterior
            )
        )
        {
            EliminarArchivoHero(
                imagenAnterior
            );
        }


        return Ok(new
        {
            mensaje =
                "Imagen principal eliminada correctamente.",

            heroImagen =
                configuracion.HeroImagen
        });
    }


    // =====================================================
    // OBTENER O CREAR CONFIGURACIÓN
    // =====================================================

    private async Task<ConfiguracionSitio>
        ObtenerOCrearConfiguracion()
    {
        var configuracion =
            await _context
                .ConfiguracionesSitio
                .OrderBy(c => c.Id)
                .FirstOrDefaultAsync();


        if (
            configuracion != null
        )
        {
            return configuracion;
        }


        configuracion =
            new ConfiguracionSitio();


        _context
            .ConfiguracionesSitio
            .Add(
                configuracion
            );


        await _context
            .SaveChangesAsync();


        return configuracion;
    }


    // =====================================================
    // ELIMINAR ARCHIVO HERO
    // =====================================================

    private void EliminarArchivoHero(
        string? rutaImagen
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                rutaImagen
            )
        )
        {
            return;
        }


        const string prefijo =
            "/uploads/sitio/";


        if (
            !rutaImagen.StartsWith(
                prefijo,
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            return;
        }


        var nombreArchivo =
            Path.GetFileName(
                rutaImagen
            );


        if (
            string.IsNullOrWhiteSpace(
                nombreArchivo
            )
        )
        {
            return;
        }


        var rutaFisica =
            Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "sitio",
                nombreArchivo
            );


        if (
            System.IO.File.Exists(
                rutaFisica
            )
        )
        {
            System.IO.File.Delete(
                rutaFisica
            );
        }
    }


    // =====================================================
    // LIMPIAR TEXTO OPCIONAL
    // =====================================================

    private static string? LimpiarTexto(
        string? valor
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                valor
            )
        )
        {
            return null;
        }


        return valor.Trim();
    }
}