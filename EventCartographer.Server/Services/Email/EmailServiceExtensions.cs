namespace EventCartographer.Server.Services.Email
{
	public static class EmailServiceExtensions
	{
		public static IServiceCollection AddEmailService(this IServiceCollection services, Action<EmailServiceConfigurationMetadata> settings)
		{
			services.AddSingleton<IEmailService, EmailService>();
			services.Configure(settings);
			return services;
		}
	}
}
