using EventCartographer.Application.Commands.PurgeExpiredData;
using MediatR;

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

        await using var scope = _factory.CreateAsyncScope();
        var mediator = scope.ServiceProvider.GetRequiredService<ISender>();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await mediator.Send(
                    new PurgeExpiredDataCommand(),
                    stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogCleanupError(ex);
            }

            await Task.Delay(_period, stoppingToken);
        }
    }
}
