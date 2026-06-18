using EventCartographer.Domain.Entities;
using EventCartographer.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Services.Background;

public class CleanupService(
    ILogger<CleanupService> logger,
    IServiceScopeFactory factory) : BackgroundService
{
    private readonly IServiceScopeFactory _factory = factory;
    private readonly ILogger<CleanupService> _logger = logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(1);
    private ApplicationDbContext? _database;

    public bool IsEnabled { get; set; }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await using var scope = _factory.CreateAsyncScope();
        _database = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (_database == null)
        {
            _logger.LogError("Can not connect to the DB in Cleanup service!");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            DateTime now = DateTime.UtcNow;

            _logger.LogInformation("Cleanup service running at: {time}", now);

            ActivationCode[] activationCodesToCleanup = await _database.ActivationCodes
                .Where(x => now > x.ExpiresAt)
                .ToArrayAsync(stoppingToken);
            User[] usersToCleanup = await _database.Users
                .Where(x => now > x.LastActivityAt.AddYears(3) || (!x.IsActivated && now > x.LastActivityAt.AddHours(12)))
                .ToArrayAsync(stoppingToken);

            _database.ActivationCodes.RemoveRange(activationCodesToCleanup);
            _database.Users.RemoveRange(usersToCleanup);

            await _database.SaveChangesAsync(stoppingToken);
            await Task.Delay(_period, stoppingToken);
        }
    }

    public override Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Cleanup Service is stopping...");
        return Task.CompletedTask;
    }
}
