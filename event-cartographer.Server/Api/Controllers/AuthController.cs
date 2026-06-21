using EventCartographer.Api.Models.Requests.Bodies;
using EventCartographer.Api.Models.Requests.Queries;
using EventCartographer.Api.Models.Responses;
using EventCartographer.Application.Common.Interfaces;
using EventCartographer.Domain.Entities;
using EventCartographer.Domain.ValueClasses;
using Hangfire;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EventCartographer.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
        IApplicationDbContext db,
        IBackgroundJobClient backgroundJobClient,
        IPasswordHandler passwordHandler) : BaseController(db)
{
    private readonly IBackgroundJobClient _backgroundJobClient = backgroundJobClient;
    private readonly IPasswordHandler _passwordHandler = passwordHandler;

    [HttpPost("sign-up")]
    public async Task<IActionResult> SignUp(
        [FromQuery] LocaleQuery query,
        [FromForm] SignUpRequest request)
    {
        if (await DB.Users.AnyAsync(x => x.Name == request.Username))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.same-username"));
        }

        if (await DB.Users.AnyAsync(x => x.Email == request.Email))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.same-email"));
        }

        if (!_passwordHandler.CheckFormat(request.Password ?? ""))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.incorrect-password"));
        }

        User user = (await DB.Users.AddAsync(new()
        {
            Name = request.Username!,
            Email = request.Email!,
            PasswordHash = _passwordHandler.Hash(request.Password!),
            PermissionToDeletePastEvents = false,
            IsActivated = false,
            LastActivityAt = DateTime.UtcNow
        })).Entity;

        ActivationCode code = (await DB.ActivationCodes.AddAsync(new()
        {
            UserId = user.Id,
            User = user,
            Action = ActivationCodeActions.Register,
            ExpiresAt = DateTime.UtcNow.AddHours(12)
        })).Entity;

        await DB.SaveChangesAsync();

        var emailURL = new UriBuilder
        {
            Scheme = HttpContext.Request.Scheme,
            Host = HttpContext.Request.Host.Host,
            Port = HttpContext.Request.Host.Port ?? -1,
            Path = "api/email",
        };

        using (var content = new FormUrlEncodedContent([
            new("email", request.Email!),
            new("token", code.Id.ToString("N")),
            new("locale", query.Locale),
        ])) { emailURL.Query = await content.ReadAsStringAsync(); }

        _backgroundJobClient.Enqueue<IEmailService>(emailService =>
            emailService.SendEmailUseTemplateAsync(
                email: request.Email!,
                templateName: ActivationCodeActions.Register,
                parameters: new Dictionary<string, string>
                {
                    { "username", request.Username! },
                    { "link", emailURL.ToString() },
                },
                query.Locale!
            )
        );

        return StatusCode(201, new UserResponse(user));
    }

    [HttpPost("sign-in")]
    public async Task<IActionResult> SignIn(
        [FromForm] SignInRequest request)
    {
        User? user;

        if (request.UsernameOrEmail?.Contains('@') == true)
        {
            request.UsernameOrEmail = request.UsernameOrEmail.ToLower();
            user = await DB.Users.FirstOrDefaultAsync(
                x => x.Email == request.UsernameOrEmail);
        }
        else
        {
            user = await DB.Users.FirstOrDefaultAsync(
                x => x.Name == request.UsernameOrEmail);
        }

        if (user == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.username-email-or-password"));
        }

        if (!user.IsActivated)
        {
            return Unauthorized(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.not-activated"));
        }

        if (!_passwordHandler.Validate(request.Password!, user.PasswordHash))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.username-email-or-password"));
        }

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(
            [
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new(ClaimTypes.Name, user.Name)
            ], CookieAuthenticationDefaults.AuthenticationScheme)),
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(3)
            }
        );

        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();
        return Ok(new UserResponse(user));
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
