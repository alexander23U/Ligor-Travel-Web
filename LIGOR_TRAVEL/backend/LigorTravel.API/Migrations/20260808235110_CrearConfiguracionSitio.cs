using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LigorTravel.API.Migrations
{
    /// <inheritdoc />
    public partial class CrearConfiguracionSitio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfiguracionesSitio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HeroEtiqueta = table.Column<string>(type: "text", nullable: false),
                    HeroTitulo = table.Column<string>(type: "text", nullable: false),
                    HeroSubtitulo = table.Column<string>(type: "text", nullable: false),
                    HeroDescripcion = table.Column<string>(type: "text", nullable: false),
                    HeroImagen = table.Column<string>(type: "text", nullable: true),
                    HeroBotonPrincipal = table.Column<string>(type: "text", nullable: false),
                    HeroBotonIA = table.Column<string>(type: "text", nullable: false),
                    HeroActivo = table.Column<bool>(type: "boolean", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    Whatsapp = table.Column<string>(type: "text", nullable: true),
                    Correo = table.Column<string>(type: "text", nullable: true),
                    Direccion = table.Column<string>(type: "text", nullable: true),
                    Facebook = table.Column<string>(type: "text", nullable: true),
                    Instagram = table.Column<string>(type: "text", nullable: true),
                    TikTok = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracionesSitio", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguracionesSitio");
        }
    }
}
