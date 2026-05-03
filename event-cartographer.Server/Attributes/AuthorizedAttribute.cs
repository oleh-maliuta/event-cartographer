using EventCartographer.Server.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EventCartographer.Server.Attributes
{
    public class AuthorizedAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.HttpContext.User?.Identity?.IsAuthenticated != true)
            {
                BaseResponse.ErrorResponse response = new("http.attribute-errors.authorized.unauthorized");
                context.Result = new UnauthorizedObjectResult(response);
            }
        }
    }
}
