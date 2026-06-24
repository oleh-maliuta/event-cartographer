using EventCartographer.Application.Interfaces;
using EventCartographer.Application.Maintenance.Commands.PurgeExpiredData;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Application.Commands.PurgeExpiredData;

public partial class PurgeExpiredDataCommandHandler(
    IApplicationDbContext database,
    ILogger<PurgeExpiredDataCommandHandler> logger) : IRequestHandler<PurgeExpiredDataCommand>
{
    private readonly IApplicationDbContext _database = database;
    private readonly ILogger<PurgeExpiredDataCommandHandler> _logger = logger;

    public async Task Handle(
        PurgeExpiredDataCommand request,
        CancellationToken cancellationToken)
    {
        DateTime now = DateTime.UtcNow;

        var activationCodesToCleanup = await _database.ActivationCodes
            .Where(x => now > x.ExpiresAt)
            .ToArrayAsync(cancellationToken);

        var usersToCleanup = await _database.Users.Where(x =>
            now > x.LastActivityAt.AddYears(5) ||
            !x.IsActivated && now > x.LastActivityAt.AddHours(12)
        ).ToArrayAsync(cancellationToken);

        if (activationCodesToCleanup.Length > 0 || usersToCleanup.Length > 0)
        {
            _database.ActivationCodes.RemoveRange(activationCodesToCleanup);
            _database.Users.RemoveRange(usersToCleanup);
            await _database.SaveChangesAsync(cancellationToken);

            _logger.LogPurgeResultInformation(
                activationCodesToCleanup.Length,
                usersToCleanup.Length);
        }
    }
}
