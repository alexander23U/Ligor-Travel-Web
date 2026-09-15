using LigorTravel.API.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LigorTravel.API.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260915221500_AmpliarDetallePaquetes")]
    public partial class AmpliarDetallePaquetes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "Horarios", table: "Paquetes", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "PuntoRecojo", table: "Paquetes", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "QueViviras", table: "Paquetes", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Itinerario", table: "Paquetes", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Incluye", table: "Paquetes", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "NoIncluye", table: "Paquetes", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Recomendaciones", table: "Paquetes", type: "text", nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Horarios", table: "Paquetes");
            migrationBuilder.DropColumn(name: "PuntoRecojo", table: "Paquetes");
            migrationBuilder.DropColumn(name: "QueViviras", table: "Paquetes");
            migrationBuilder.DropColumn(name: "Itinerario", table: "Paquetes");
            migrationBuilder.DropColumn(name: "Incluye", table: "Paquetes");
            migrationBuilder.DropColumn(name: "NoIncluye", table: "Paquetes");
            migrationBuilder.DropColumn(name: "Recomendaciones", table: "Paquetes");
        }
    }
}
