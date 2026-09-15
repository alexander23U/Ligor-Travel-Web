using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LigorTravel.API.Migrations
{
    /// <inheritdoc />
    public partial class CrearTablaOpiniones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Opiniones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    PaqueteId = table.Column<int>(type: "integer", nullable: false),
                    Calificacion = table.Column<int>(type: "integer", nullable: false),
                    Comentario = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opiniones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Opiniones_Paquetes_PaqueteId",
                        column: x => x.PaqueteId,
                        principalTable: "Paquetes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Opiniones_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Opiniones_PaqueteId",
                table: "Opiniones",
                column: "PaqueteId");

            migrationBuilder.CreateIndex(
                name: "IX_Opiniones_UsuarioId",
                table: "Opiniones",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Opiniones");
        }
    }
}
