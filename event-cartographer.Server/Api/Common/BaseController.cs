using EventCartographer.Application.Commands.GetUserById;
using EventCartographer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventCartographer.Api.Common;

public abstract class BaseController(ISender mediator) : ControllerBase
{
    protected ISender Mediator { get; } = mediator;
    protected Guid AuthorizedUserId
    {
        get
        {
            string? strId = HttpContext.User.Claims
                .FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(strId, out Guid id))
                throw new InvalidOperationException("This property accessible only for authorized users.");

            return id;
        }
    }

    protected async Task<User> GetAuthUser()
    {
        return (await Mediator.Send(new GetUserByIdCommand(AuthorizedUserId))).Data ??
            throw new Exception("This method accessible only for authorized users.");
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
