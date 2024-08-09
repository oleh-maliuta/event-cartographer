using EventCartographer.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Server.Services.EntityFramework
{
    public class DbApp : DbContext
    {
        public DbSet<ActivationCode> ActivationCodes { get; set; }
        public DbSet<Marker> Markers { get; set; }
        public DbSet<User> Users { get; set; }

        public DbApp(DbContextOptions<DbApp> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // column properties

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Name)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // 1-to-many relationships

            modelBuilder.Entity<User>()
                .HasMany(u => u.ActivationCodes)
                .WithOne(ac => ac.User)
                .HasForeignKey(ac => ac.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Markers)
                .WithOne(ac => ac.User)
                .HasForeignKey(ac => ac.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // other

            base.OnModelCreating(modelBuilder);
        }
    }
}
