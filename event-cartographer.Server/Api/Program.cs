namespace EventCartographer.Api;

public class Program
{
    public static void Main(string[] args)
    {
        Startup.LoadEnvDataFromFileIfExists(
            Path.Join(Directory.GetCurrentDirectory(), ".env.dev"));

        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        Startup.ConfigureKestrel(builder);
        Startup.ConfigureServices(builder);

        WebApplication app = builder.Build();
        Startup.MigrateDB(app);
        Startup.ConfigureApplication(app);

        app.Run();
    }
}