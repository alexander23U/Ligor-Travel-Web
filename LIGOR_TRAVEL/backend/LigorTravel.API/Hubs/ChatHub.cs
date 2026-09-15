using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using LigorTravel.API.Data;
using LigorTravel.API.DTOs;
using LigorTravel.API.Models;

namespace LigorTravel.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task EnviarMensaje(int usuarioId, string texto)
    {
        var usuario = await _context.Usuarios.FindAsync(usuarioId);

        if (usuario == null)
        {
            await Clients.Caller.SendAsync("ErrorMensaje", "Usuario no existe");
            return;
        }

        if (string.IsNullOrWhiteSpace(texto))
        {
            await Clients.Caller.SendAsync("ErrorMensaje", "El mensaje no puede estar vacío");
            return;
        }

        var mensaje = new Mensaje
        {
            UsuarioId = usuarioId,
            Texto = texto,
            Fecha = DateTime.UtcNow
        };

        _context.Mensajes.Add(mensaje);
        await _context.SaveChangesAsync();

        var respuesta = new MensajeResponseDto
        {
            Id = mensaje.Id,
            Usuario = usuario.Nombres + " " + usuario.Apellidos,
            Texto = mensaje.Texto,
            Fecha = mensaje.Fecha
        };

        await Clients.All.SendAsync("RecibirMensaje", respuesta);
    }
}