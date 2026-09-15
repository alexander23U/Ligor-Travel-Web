using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LigorTravel.API.Migrations
{
    public partial class AgregarEditorVisualHero : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Solo agrega el campo del editor visual. No modifica Pagos, Opiniones ni otras tablas.
            migrationBuilder.Sql("ALTER TABLE \"ConfiguracionesSitio\" ADD COLUMN IF NOT EXISTS \"HeroDisenoJson\" text;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE \"ConfiguracionesSitio\" DROP COLUMN IF EXISTS \"HeroDisenoJson\";");
        }
    }
}
