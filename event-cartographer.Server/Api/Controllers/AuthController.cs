using EventCartographer.Api.Common;
using EventCartographer.Api.Models.Requests.Bodies;
using EventCartographer.Api.Models.Requests.Queries;
using EventCartographer.Api.Models.Responses;
using EventCartographer.Application.Commands.SignIn;
using EventCartographer.Application.Commands.SignUp;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventCartographer.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    ISender mediator) : BaseController(mediator)
{

    [HttpPost("sign-up")]
    public async Task<IActionResult> SignUp(
        [FromQuery] LocaleQuery query,
        [FromForm] SignUpRequest request)
    {
        var result = await Mediator.Send(new SignUpCommand(
            request.Username,
            request.Email,
            request.Password,
            query.Locale,
            new UriBuilder
            {
                Scheme = HttpContext.Request.Scheme,
                Host = HttpContext.Request.Host.Host,
                Port = HttpContext.Request.Host.Port ?? -1,
                Path = "api/email",
            }.Uri));

        if (!result.IsSuccess)
        {
            return StatusCode(
                result.StatusCode,
                new BaseResponse.ErrorResponse(result.ErrorMessage));
        }

        return StatusCode(
            result.StatusCode,
            new UserResponse(result.Data!));
    }

    [HttpPost("sign-in")]
    public async Task<IActionResult> SignIn(
        [FromForm] SignInRequest request)
    {
        var result = await Mediator.Send(new SignInCommand(
            request.UsernameOrEmail,
            request.Password));

        if (!result.IsSuccess)
            return StatusCode(
                result.StatusCode,
                new BaseResponse.ErrorResponse(result.ErrorMessage));

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(
            [
                new(ClaimTypes.NameIdentifier, result.Data!.Id.ToString()),
                new(ClaimTypes.Name, result.Data.Name)
            ], CookieAuthenticationDefaults.AuthenticationScheme)),
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(3)
            }
        );

        return StatusCode(
            result.StatusCode,
            new UserResponse(result.Data));
    }

    [HttpGet("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new BaseResponse.SuccessResponse(null));
    }

    [HttpGet("check")]
    public IActionResult Check()
    {
        if (User?.Identity?.IsAuthenticated == true)
        {
            return Ok(new BaseResponse.SuccessResponse(null));
        }
        return Unauthorized(new BaseResponse.ErrorResponse(null));
    }
}
