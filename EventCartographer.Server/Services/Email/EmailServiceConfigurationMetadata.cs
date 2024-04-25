namespace EventCartographer.Server.Services.Email
{
	public class EmailServiceConfigurationMetadata
	{
		public string SenderName { get; set; }
		public string Email { get; set; }
		public string Password { get; set; }
		public string Host { get; set; } = "smtp.gmail.com";
		public int Port { get; set; } = 587;
		public bool UseSSL { get; set; } = true;
		public bool UseDefaultCredentials { get; set; } = false;
		public string EmailTemplatesFolder { get; set; } = "EmailTemplates";
	}
}
