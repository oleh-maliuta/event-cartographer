using EventCartographer.Server.Models;
using EventCartographer.Server.Services.EntityFramework;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Server.Services.Background
{
    public class CleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _factory;
        private readonly ILogger<CleanupService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromHours(1);
        private DbApp? _database;

        public bool IsEnabled { get; set; }

        public CleanupService(
            ILogger<CleanupService> logger,
            IServiceScopeFactory factory)
        {
            _logger = logger;
            _factory = factory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await using var scope = _factory.CreateAsyncScope();
            _database = scope.ServiceProvider.GetRequiredService<DbApp>();

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
                    .Where(x => now > x.LastActivityAt.AddYears(3))
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
}
