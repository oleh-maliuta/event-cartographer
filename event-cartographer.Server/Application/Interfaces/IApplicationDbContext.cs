using EventCartographer.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<ActivationCode> ActivationCodes { get; }
    DbSet<Marker> Markers { get; }
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
