using EventCartographer.Server.Services.Background;
using EventCartographer.Server.Services.Email;
using EventCartographer.Server.Services.EntityFramework;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<DbApp>(options =>
            {
                options.UseSqlServer(builder.Configuration["EF:ConnectionString"]);
            });

            builder.Services.AddControllersWithViews();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddCors();

            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie();

            builder.Services.AddHostedService<CleanupService>();

            builder.Services.AddEmailService(e =>
            {
                e.Email = builder.Configuration["Email:EmailAddress"]!;
                e.SenderName = builder.Configuration["Email:SenderName"]!;
                e.Password = builder.Configuration["Email:Password"]!;
                e.Host = builder.Configuration["Email:Host"]!;
                e.Port = int.Parse(builder.Configuration["Email:Port"]!);
                e.EmailTemplatesFolder = builder.Configuration["Email:EmailTemplatesFolder"]!;
            });

            WebApplication app = builder.Build();

            using (IServiceScope scope = app.Services.CreateScope())
            {
                DbApp db = scope.ServiceProvider.GetRequiredService<DbApp>();

                if (!db.Database.CanConnect())
                {
                    throw new NotImplementedException("Can not connect to the DB!");
                }
            }

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseDefaultFiles();
            app.UseRouting();
            app.UseAuthorization();
            app.UseAuthentication();
            app.UseCors(builder => 
                builder.AllowCredentials().AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:5173"));

            app.MapControllers();
            app.MapFallbackToFile("/index.html");
            app.MapDefaultControllerRoute();

            app.Run();
        }
    }
}
