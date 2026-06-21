using EventCartographer.Application.Maintenance.Commands.PurgeExpiredData;

namespace EventCartographer.Infrastructure.BackgroundServices.CleanupService;

public class CleanupService(
    ILogger<CleanupService> logger,
    IServiceScopeFactory factory) : BackgroundService
{
    private readonly IServiceScopeFactory _factory = factory;
    private readonly ILogger<CleanupService> _logger = logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogServiceStartedInformation();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = _factory.CreateAsyncScope();
                var handler = scope.ServiceProvider.GetRequiredService<PurgeExpiredDataCommand>();

                await handler.ExecuteAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogCleanupError(ex);
            }

            await Task.Delay(_period, stoppingToken);
        }
    }
}
