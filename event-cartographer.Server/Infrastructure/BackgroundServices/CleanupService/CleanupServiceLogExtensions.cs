namespace EventCartographer.Infrastructure.BackgroundServices.CleanupService;

public static partial class CleanupServiceLogExtensions
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Cleanup background routing service started.")]
    public static partial void LogServiceStartedInformation(
        this ILogger logger);

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "An error occurred while executing data cleanup rules.")]
    public static partial void LogCleanupError(
        this ILogger logger,
        Exception ex);
}
