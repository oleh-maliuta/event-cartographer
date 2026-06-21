using EventCartographer.Application.Common.Helpers;
using EventCartographer.Application.Common.Interfaces;
using EventCartographer.Domain.Constants;
using Microsoft.Extensions.Options;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Mail;

namespace EventCartographer.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly EmailServiceConfigurationMetadata _configuration;
    private readonly string _emailTemplatesPath;

    private readonly ConcurrentDictionary<string, string> _templateCache = new();

    public EmailService(IOptions<EmailServiceConfigurationMetadata> configuration)
    {
        _configuration = configuration.Value;
        string combinedPath = Path.Combine(_configuration.EmailTemplatesPath);
        _emailTemplatesPath = Path.IsPathRooted(combinedPath)
            ? combinedPath
            : Path.Combine(Directory.GetCurrentDirectory(), combinedPath);
    }

    public async Task SendEmailAsync(string email, string subject, string message, bool isHtml = false)
    {
        using SmtpClient client = Connect();
        using MailMessage mailMessage = new(_configuration.Email, email, subject, message)
        {
            IsBodyHtml = isHtml
        };

        await client.SendMailAsync(mailMessage);
    }

    public async Task SendEmailUseTemplateAsync(
        string email,
        string templateName,
        Dictionary<string, string>? parameters = null,
        string language = LocaleConstants.DefaultLocale,
        string? subject = null)
    {
        string fullTempleteName = templateName + ".html";
        string templatePath = Path.Combine(_emailTemplatesPath, language, fullTempleteName);
        string template = _templateCache.GetOrAdd(templatePath, path =>
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Template {fullTempleteName} not found at {path}");
            }
            return File.ReadAllText(path);
        });

        if (parameters != null)
        {
            foreach (var parameter in parameters)
            {
                template = template.Replace($@"{{{{{parameter.Key}}}}}", parameter.Value);
            }
        }

        subject ??= EmailSubjectParser.ExtractSubject(template);

        await SendEmailAsync(email, subject, template, true);
    }

    private SmtpClient Connect()
    {
        return new SmtpClient
        {
            Host = _configuration.Host,
            Port = _configuration.Port,
            EnableSsl = _configuration.UseSSL,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = _configuration.UseDefaultCredentials,
            Credentials = new NetworkCredential(_configuration.Email, _configuration.Password)
        };
    }
}
