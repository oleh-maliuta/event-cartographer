using EventCartographer.Server.Models;
using EventCartographer.Server.Services.EntityFramework;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventCartographer.Server.Controllers
{
    public abstract class BaseController : ControllerBase
    {
        protected DbApp DB { get; }
        protected int AuthorizedUserId
        {
            get
            {
                var strId = HttpContext.User.Claims
                    .FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(strId, out int id))
                {
                    throw new InvalidOperationException("This property accessible only for authorized users.");
                }

                return id;
            }
        }
        protected User AuthorizedUser
        {
            get
            {
                User? user = DB.Users.SingleOrDefault(x => x.Id == AuthorizedUserId);

                return user is null
                    ? throw new InvalidOperationException("This property accessible only for authorized users.")
                    : user;
            }
        }

        public BaseController(DbApp db)
        {
            DB = db;
        }

        protected ContentResult MessageContentResult(
            bool isSuccess,
            string title,
            string message)
        {
            string headerStyle = isSuccess ? "\"color: #00BA00\"" : "\"color: #DD0000\"";
            string messageStyle = "\"font-weight: bold; font-size: 1.3rem;\"";
            string charsetMeta = "<meta charset=\"utf-8\" />";
            return Content($@"
                <html>
                    <head>
                        {charsetMeta}
                        <title>{title}</title>
                    </head>
                    <body>
                        <h1 style={headerStyle}>{title}</h1>
                        <p style={messageStyle}>{message}</p>
                    </body>
                </html>
            ", "text/html");
        }
    }
}
