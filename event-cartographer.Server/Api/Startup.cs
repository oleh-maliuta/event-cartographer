using EventCartographer.Application.Common.Interfaces;
using EventCartographer.Application.Maintenance.Commands;
using EventCartographer.Infrastructure.BackgroundServices;
using EventCartographer.Infrastructure.Database;
using EventCartographer.Infrastructure.Email;
using EventCartographer.Infrastructure.Localization;
using EventCartographer.Infrastructure.Security;
using Hangfire;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace EventCartographer.Api;

public static class Startup
{
    public static bool LoadEnvDataFromFileIfExists(string filePath)
    {
        if (!File.Exists(filePath))
            return false;

        foreach (string line in File.ReadAllLines(filePath))
        {
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
                continue;

            string[] parts = line.Split('=', 2);
            if (parts.Length != 2)
                continue;

            string key = parts[0].Trim();
            string value = parts[1].Trim();

            if ((value.StartsWith('"') && value.EndsWith('"')) ||
                (value.StartsWith('\'') && value.EndsWith('\'')))
            {
                value = value[1..^1];
            }

            Environment.SetEnvironmentVariable(key, value);
        }

        return true;
    }

    public static void ConfigureKestrel(WebApplicationBuilder builder)
    {
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.ListenAnyIP(8081, listenOptions =>
            {
                listenOptions.Protocols = HttpProtocols.Http1AndHttp2AndHttp3;
                listenOptions.UseHttps(CreateDevelopmentCertificate());
            });
        });
    }

    public static void ConfigureServices(WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<PurgeExpiredDataCommand>();
        builder.Services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        builder.Services.AddSingleton<IPasswordHandler, PasswordHandler>();

        builder.Services.AddHostedService<CleanupService>();

        builder.Services.AddControllersWithViews();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddCors();

        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromDays(3);
                options.SlidingExpiration = true;
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });

        builder.Services.AddHangfire(config =>
        {
            string? conn = Environment.GetEnvironmentVariable("HANGFIRE_CONNECTION_STRING");
            if (string.IsNullOrWhiteSpace(conn))
            {
                throw new InvalidOperationException("Hangfire connection string is not configured.");
            }

            config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseSqlServerStorage(conn);
        });
        builder.Services.AddHangfireServer();

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            string? conn = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrWhiteSpace(conn))
            {
                throw new InvalidOperationException("Database connection string is not configured.");
            }

            options.UseSqlServer(conn);
        });

        builder.Services.AddEmailService(e =>
        {
            e.Email = Environment.GetEnvironmentVariable("EMAIL_SENDER_ADDRESS")!;
            e.SenderName = Environment.GetEnvironmentVariable("EMAIL_SENDER_NAME")!;
            e.Password = Environment.GetEnvironmentVariable("EMAIL_SENDER_PASSWORD")!;
            e.Host = Environment.GetEnvironmentVariable("EMAIL_HOST")!;
            e.Port = int.Parse(Environment.GetEnvironmentVariable("EMAIL_PORT")!);
            e.EmailTemplatesPath = builder.Configuration
                .GetSection("Email:EmailTemplatesPath").Get<string[]>()!;
        });

        builder.Services.AddLocalizationService(l =>
        {
            l.DefaultLanguage = builder.Configuration["Localization:DefaultLanguage"]!;
            l.StringsPath = builder.Configuration
                .GetSection("Localization:StringsPath").Get<string[]>()!;
        });
    }

    public static void MigrateDB(WebApplication app)
    {
        using IServiceScope scope = app.Services.CreateScope();
        ApplicationDbContext db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        try
        {
            db.Database.Migrate();
        }
        catch (Exception ex)
        {
            throw new NotImplementedException($"Can not connect to the DB! Error: {ex.Message}", ex);
        }
    }

    public static void ConfigureApplication(WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHangfireDashboard();
        app.UseHttpsRedirection();
        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapFallbackToFile("/index.html");
        app.MapDefaultControllerRoute();
    }

    private static X509Certificate2 CreateDevelopmentCertificate()
    {
        using RSA rsa = RSA.Create(2048);
        var request = new CertificateRequest(
            "CN=localhost",
            rsa,
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1);

        request.CertificateExtensions.Add(new X509BasicConstraintsExtension(false, false, 0, false));
        request.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature | X509KeyUsageFlags.KeyEncipherment, false));
        request.CertificateExtensions.Add(new X509SubjectKeyIdentifierExtension(request.PublicKey, false));

        var sanBuilder = new SubjectAlternativeNameBuilder();
        sanBuilder.AddDnsName("localhost");
        sanBuilder.AddIpAddress(IPAddress.Loopback);
        sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);
        request.CertificateExtensions.Add(sanBuilder.Build());

        var certificate = request.CreateSelfSigned(
            DateTimeOffset.UtcNow.AddDays(-1),
            DateTimeOffset.UtcNow.AddYears(1));

        return new X509Certificate2(certificate.Export(X509ContentType.Pfx));
    }
}
