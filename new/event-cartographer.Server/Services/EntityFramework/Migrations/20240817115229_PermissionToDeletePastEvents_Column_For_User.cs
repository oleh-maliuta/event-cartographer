using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventCartographer.Server.Services.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class PermissionToDeletePastEvents_Column_For_User : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PermissionToDeletePastEvents",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PermissionToDeletePastEvents",
                table: "Users");
        }
    }
}
