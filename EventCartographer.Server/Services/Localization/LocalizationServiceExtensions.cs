namespace EventCartographer.Server.Services.Localization
{
    public static class LocalizationServiceExtensions
    {
        public static IServiceCollection AddLocalizationService(
            this IServiceCollection services,
            Action<LocalizationServiceConfigurationMetadata> settings)
        {
            services.AddSingleton<ILocalizationService, LocalizationService>();
            services.Configure(settings);
            return services;
        }
    }
}
