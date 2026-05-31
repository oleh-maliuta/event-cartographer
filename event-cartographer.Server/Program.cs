namespace EventCartographer.Server;

public class Program
{
    public static void Main(string[] args)
    {
        Setup.LoadEnvDataFromFileIfExists(
            Path.Join(Directory.GetCurrentDirectory(), ".env.dev"));

        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        Setup.ConfigureKestrel(builder);
        Setup.ConfigureServices(builder);

        WebApplication app = builder.Build();
        Setup.MigrateDB(app);
        Setup.ConfigureApplication(app);

        app.Run();
    }
}