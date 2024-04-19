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

            builder.Services.Configure<DbSettings>(builder.Configuration.GetSection("MongoDb"));
            builder.Services.AddSingleton<MongoDbService>();

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
