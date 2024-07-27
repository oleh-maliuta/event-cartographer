
using EventCartographer.Server.Services.MongoDB;
using MongoDB.Driver;

namespace EventCartographer.Server.Services.Background
{
    public class CleanupService : BackgroundService
    {
        private readonly ILogger<CleanupService> _logger;
        private readonly MongoDbService _database;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1);

        public CleanupService(ILogger<CleanupService> logger, MongoDbService database)
        {
            _logger = logger;
            _database = database;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Database cleanup service running at: {time}", DateTimeOffset.UtcNow);

                await _database.ActivationCodes.DeleteManyAsync(x => DateTime.UtcNow > x.ExpiresAt, stoppingToken);

                await Task.Delay(_cleanupInterval, stoppingToken);
            }
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Cleaning Service is stopping.");
            await base.StopAsync(stoppingToken);
        }
    }
}
