using EventCartographer.Application.Interfaces;

namespace EventCartographer.Infrastructure.Email;

public static class EmailServiceExtensions
{
    public static IServiceCollection AddEmailService(this IServiceCollection services, Action<EmailServiceConfigurationMetadata> settings)
    {
        services.AddSingleton<IEmailService, EmailService>();
        services.Configure(settings);
        return services;
    }
}
