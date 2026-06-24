using EventCartographer.Application.Interfaces;
using EventCartographer.Domain.Entities;
using EventCartographer.Infrastructure.Database.ValueGenerators;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Infrastructure.Database;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<ActivationCode> ActivationCodes => Set<ActivationCode>();
    public DbSet<Marker> Markers => Set<Marker>();
    public DbSet<User> Users => Set<User>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
        configurationBuilder.Properties<Guid>()
            .HaveConversion<GuidV7ValueGenerator>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // column properties

        modelBuilder.Entity<User>()
            .Property(a => a.Id)
            .HasConversion<string>();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Name)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<ActivationCode>()
            .Property(a => a.Id)
            .HasConversion<string>();

        modelBuilder.Entity<ActivationCode>()
            .Property(a => a.UserId)
            .HasConversion<string>();

        modelBuilder.Entity<Marker>()
            .Property(a => a.Id)
            .HasConversion<string>();

        modelBuilder.Entity<Marker>()
            .Property(a => a.UserId)
            .HasConversion<string>();

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
