using Microsoft.EntityFrameworkCore;
using LigorTravel.API.Models;

namespace LigorTravel.API.Data;

public class AppDbContext : DbContext
{
public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
public DbSet<Usuario> Usuarios { get; set; }
public DbSet<Paquete> Paquetes { get; set; }
public DbSet<Reserva> Reservas { get; set; }
public DbSet<Pago> Pagos { get; set; }
public DbSet<Opinion> Opiniones { get; set; }
public DbSet<Mensaje> Mensajes { get; set; }
public DbSet<ConfiguracionSitio> ConfiguracionesSitio { get; set; }

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // =====================================================
    // USUARIOS
    // =====================================================

    modelBuilder.Entity<Usuario>(entity =>
    {
        entity.Property(u => u.Nombres)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(u => u.Apellidos)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(u => u.Correo)
            .HasMaxLength(254)
            .IsRequired();

        entity.Property(u => u.Telefono)
            .HasMaxLength(30);

        entity.Property(u => u.Rol)
            .HasMaxLength(30)
            .IsRequired();

        entity.HasIndex(u => u.Correo)
            .IsUnique();

        entity.ToTable(t =>
            t.HasCheckConstraint(
                "CK_Usuarios_Rol",
                "\"Rol\" IN ('Cliente','Vendedor','Administrador')"
            )
        );
    });

    // =====================================================
    // PAQUETES
    // =====================================================

    modelBuilder.Entity<Paquete>(entity =>
    {
        entity.Property(p => p.Nombre)
            .HasMaxLength(150)
            .IsRequired();

        entity.Property(p => p.Precio)
            .HasPrecision(12, 2);

        entity.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_Paquetes_Precio",
                "\"Precio\" >= 0"
            );

            t.HasCheckConstraint(
                "CK_Paquetes_Cupos",
                "\"Cupos\" >= 0"
            );

            t.HasCheckConstraint(
                "CK_Paquetes_Duracion",
                "\"DuracionDias\" > 0"
            );
        });
    });

    // =====================================================
    // RESERVAS
    // =====================================================

    modelBuilder.Entity<Reserva>(entity =>
    {
        entity.Property(r => r.Total)
            .HasPrecision(12, 2);

        entity.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_Reservas_Cantidad",
                "\"CantidadPersonas\" > 0"
            );

            t.HasCheckConstraint(
                "CK_Reservas_Total",
                "\"Total\" >= 0"
            );
        });
    });

    // =====================================================
    // PAGOS
    // =====================================================

    modelBuilder.Entity<Pago>(entity =>
    {
        entity.Property(p => p.Monto)
            .HasPrecision(12, 2);

        entity.HasOne(p => p.Reserva)
            .WithOne(r => r.Pago)
            .HasForeignKey<Pago>(p => p.ReservaId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(p => p.ReservaId)
            .IsUnique();

        entity.ToTable(t =>
            t.HasCheckConstraint(
                "CK_Pagos_Monto",
                "\"Monto\" >= 0"
            )
        );
    });

    // =====================================================
    // OPINIONES
    // =====================================================

    modelBuilder.Entity<Opinion>(entity =>
    {
        entity.HasIndex(o => new
        {
            o.UsuarioId,
            o.PaqueteId
        }).IsUnique();

        entity.Property(o => o.Comentario)
            .HasMaxLength(1000);

        entity.ToTable(t =>
            t.HasCheckConstraint(
                "CK_Opiniones_Calificacion",
                "\"Calificacion\" BETWEEN 1 AND 5"
            )
        );
    });

    // =====================================================
    // MENSAJES
    // =====================================================

    modelBuilder.Entity<Mensaje>(entity =>
    {
        entity.Property(m => m.Texto)
            .HasMaxLength(2000)
            .IsRequired();
    });
}
}
