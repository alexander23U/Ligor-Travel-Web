using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LigorTravel.API.Migrations
{
    /// <inheritdoc />
    public partial class CompletarCategoriaPaquetes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Paquetes",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Paquetes");
        }
    }
}
