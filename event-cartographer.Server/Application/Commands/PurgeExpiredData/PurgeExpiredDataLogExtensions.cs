namespace EventCartographer.Application.Maintenance.Commands.PurgeExpiredData;

public static partial class PurgeExpiredDataLogExtensions
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Purged {codesCount} expired activation codes and {usersCount} stale users.")]
    public static partial void LogPurgeResultInformation(
        this ILogger logger,
        int codesCount,
        int usersCount);
}
