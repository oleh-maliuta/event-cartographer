using EventCartographer.Server.Services.Email;
using EventCartographer.Server.Services.MongoDB;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace EventCartographer.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllersWithViews();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddCors();

            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie();

            builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
            builder.Services.AddSingleton<MongoDbService>();

            builder.Services.AddEmailService(e =>
            {
                e.Email = builder.Configuration["Email:EmailAddress"];
                e.SenderName = builder.Configuration["Email:SenderName"];
                e.Password = builder.Configuration["Email:Password"];
                e.Host = builder.Configuration["Email:Host"];
                e.Port = int.Parse(builder.Configuration["Email:Port"]);
                e.EmailTemplatesFolder = builder.Configuration["Email:EmailTemplatesFolder"];
            });

            var app = builder.Build();

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
