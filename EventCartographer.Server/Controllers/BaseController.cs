using EventCartographer.Server.Models;
using EventCartographer.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;

namespace EventCartographer.Server.Controllers
{
    public abstract class BaseController : ControllerBase
    {
        protected MongoDbService DB { get; }
        protected string AuthorizedUserId
        {
            get
            {
                string? id = HttpContext.User.Claims
                    .FirstOrDefault(p => p.Type == ClaimTypes.NameIdentifier)?.Value;

                return id ?? throw new InvalidOperationException(
                    "This property accessible only for authorized users.");
            }
        }
        protected User AuthorizedUser
        {
            get
            {
                User? user = DB.Users.Find(p => p.Id == AuthorizedUserId).FirstOrDefault();

                return user ?? throw new InvalidOperationException(
                    "This property accessible only for authorized users.");
            }
        }

        public BaseController(MongoDbService db)
        {
            DB = db;
        }
    }
}
