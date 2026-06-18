using EventCartographer.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Application.Maintenance.Commands;

public class PurgeExpiredDataCommand(
    IApplicationDbContext database,
    ILogger<PurgeExpiredDataCommand> logger)
{
    private readonly IApplicationDbContext _database = database;
    private readonly ILogger<PurgeExpiredDataCommand> _logger = logger;

    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        DateTime now = DateTime.UtcNow;

        var activationCodesToCleanup = await _database.ActivationCodes
            .Where(x => now > x.ExpiresAt)
            .ToArrayAsync(cancellationToken);

        var usersToCleanup = await _database.Users
            .Where(x => now > x.LastActivityAt.AddYears(3) || (!x.IsActivated && now > x.LastActivityAt.AddHours(12)))
            .ToArrayAsync(cancellationToken);

        if (activationCodesToCleanup.Length > 0 || usersToCleanup.Length > 0)
        {
            _database.ActivationCodes.RemoveRange(activationCodesToCleanup);
            _database.Users.RemoveRange(usersToCleanup);
            await _database.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Purged {CodesCount} expired activation codes and {UsersCount} stale users.",
                activationCodesToCleanup.Length,
                usersToCleanup.Length);
        }
    }
}
