namespace EventCartographer.Server.Services.Email
{
	public interface IEmailService
	{
		public Task SendEmailAsync(string email, string subject, string message, bool isHtml = false);
		public Task SendEmailUseTemplateAsync(string email, string templateName, Dictionary<string, string>? parameters = null, string? subject = null);
	}
}
