using EventCartographer.Api.Attributes;
using EventCartographer.Api.Models.Requests.Bodies;
using EventCartographer.Api.Models.Requests.Queries;
using EventCartographer.Api.Models.Responses;
using EventCartographer.Application.Common.Interfaces;
using EventCartographer.Domain.Entities;
using EventCartographer.Domain.ValueClasses;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(
        IApplicationDbContext db,
        IBackgroundJobClient backgroundJobClient,
        IPasswordHandler passwordHandler) : BaseController(db)
{
    private readonly IBackgroundJobClient _backgroundJobClient = backgroundJobClient;
    private readonly IPasswordHandler _passwordHandler = passwordHandler;

    [Authorized]
    [HttpGet("self")]
    public IActionResult SelfInfo()
    {
        return Ok(new UserResponse(AuthorizedUser));
    }

    [Authorized]
    [HttpPut("info")]
    public async Task<IActionResult> UpdateUserInfo(
        [FromBody] UpdateUserInfoRequest request)
    {
        User user = AuthorizedUser;

        if (await DB.Users.AnyAsync(x => x.Name == request.Username && x.Id != user.Id))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-info.same-username"));
        }

        if (user.PermissionToDeletePastEvents != request.PermissionToDeletePastEvents)
        {
            Marker[] passedEvents = await DB.Markers
                .Where(x => x.UserId == user.Id && x.StartsAt < DateTime.UtcNow)
                .ToArrayAsync();

            DB.Markers.RemoveRange(passedEvents);
        }

        user.Name = request.Username!;
        user.PermissionToDeletePastEvents = request.PermissionToDeletePastEvents!.Value;
        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();
        return Ok(new UserResponse(user));
    }

    [Authorized]
    [HttpPut("password")]
    public async Task<IActionResult> UpdateUserPassword(
        [FromForm] UpdateUserPasswordRequest request)
    {
        User? user = AuthorizedUser;

        if (!_passwordHandler.Validate(request.OldPassword!, user.PasswordHash))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-password.invalid-old-password"));
        }

        if (!_passwordHandler.CheckFormat(request.NewPassword ?? ""))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-password.incorrect-password"));
        }

        user.PasswordHash = _passwordHandler.Hash(request.NewPassword!);
        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();
        return Ok(new UserResponse(user));
    }

    [Authorized]
    [HttpPut("email")]
    public async Task<IActionResult> UpdateUserEmail(
        [FromQuery] LocaleQuery query,
        [FromForm] UpdateUserEmailRequest request)
    {
        User user = AuthorizedUser;

        if (user.Email == request.Email)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.current-address"));
        }

        if (await DB.Users.AnyAsync(x => x.Email == request.Email))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.same-email"));
        }

        if (!_passwordHandler.Validate(request.Password!, user.PasswordHash))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.invalid-password"));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .FirstOrDefaultAsync(x =>
                x.UserId == user.Id &&
                x.Action.StartsWith(ActivationCodeActions.ChangeEmail));

        if (activationCode == null)
        {
            activationCode = (await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id!,
                User = user,
                Action = $"{ActivationCodeActions.ChangeEmail},{request.Email}",
                ExpiresAt = DateTime.UtcNow.AddHours(12)
            })).Entity;
        }
        else
        {
            activationCode.ExpiresAt = DateTime.UtcNow.AddHours(12);
        }

        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();

        var emailURL = new UriBuilder
        {
            Scheme = HttpContext.Request.Scheme,
            Host = HttpContext.Request.Host.Host,
            Port = HttpContext.Request.Host.Port ?? -1,
            Path = "api/email",
        };

        using (var content = new FormUrlEncodedContent([
            new("email", user.Email),
            new("token", activationCode.Id.ToString("N")),
            new("locale", query.Locale),
        ])) { emailURL.Query = await content.ReadAsStringAsync(); }

        _backgroundJobClient.Enqueue<IEmailService>(emailService =>
            emailService.SendEmailUseTemplateAsync(
                email: request.Email!,
                templateName: ActivationCodeActions.ChangeEmail,
                parameters: new Dictionary<string, string>
                {
                    { "username", user.Name },
                    { "link", emailURL.ToString() }
                },
                query.Locale!
            )
        );

        return Ok(new BaseResponse.SuccessResponse(null));
    }

    [Authorized]
    [HttpPut("delete")]
    public async Task<IActionResult> DeleteUser(
        [FromQuery] LocaleQuery query,
        [FromForm] DeleteUserRequest request)
    {
        User? user = AuthorizedUser;

        if (!_passwordHandler.Validate(request.Password!, user.PasswordHash))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.delete-user.invalid-password"));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .FirstOrDefaultAsync(x => x.UserId == user.Id && x.Action == ActivationCodeActions.DeleteAccount);

        if (activationCode == null)
        {
            activationCode = (await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id!,
                User = user,
                Action = ActivationCodeActions.DeleteAccount,
                ExpiresAt = DateTime.UtcNow.AddHours(12)
            })).Entity;
        }
        else
        {
            activationCode.ExpiresAt = DateTime.UtcNow.AddHours(12);
        }

        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();

        var emailURL = new UriBuilder
        {
            Scheme = HttpContext.Request.Scheme,
            Host = HttpContext.Request.Host.Host,
            Port = HttpContext.Request.Host.Port ?? -1,
            Path = "api/email",
        };

        using (var content = new FormUrlEncodedContent([
            new("email", user.Email),
            new("token", activationCode.Id.ToString("N")),
            new("locale", query.Locale),
        ])) { emailURL.Query = await content.ReadAsStringAsync(); }

        _backgroundJobClient.Enqueue<IEmailService>(emailService =>
            emailService.SendEmailUseTemplateAsync(
                email: user.Email,
                templateName: ActivationCodeActions.DeleteAccount,
                parameters: new Dictionary<string, string>
                {
                    { "username", user.Name },
                    { "link", emailURL.ToString() }
                },
                query.Locale!
            )
        );

        return Ok(new BaseResponse.SuccessResponse(null));
    }

    [HttpPut("resend-email-confirmation")]
    public async Task<IActionResult> ResendEmailConfirmation(
        [FromQuery] LocaleQuery query,
        [FromForm] ResendEmailConfirmationRequest request)
    {
        User? user;

        if (request.UsernameOrEmail?.Contains('@') == true)
        {
            request.UsernameOrEmail = request.UsernameOrEmail.ToLower();
            user = await DB.Users.FirstOrDefaultAsync(
                x => x.Email == request.UsernameOrEmail && !x.IsActivated);
        }
        else
        {
            user = await DB.Users.FirstOrDefaultAsync(
                x => x.Name == request.UsernameOrEmail && !x.IsActivated);
        }

        if (user == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.resend-email-confirmation.user-not-found-or-activated"));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .FirstOrDefaultAsync(x => user.Id == x.UserId && x.Action == ActivationCodeActions.Register);

        if (activationCode == null)
        {
            activationCode = (await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id,
                User = user,
                Action = ActivationCodeActions.Register,
                ExpiresAt = DateTime.UtcNow.AddHours(12)
            })).Entity;
        }
        else
        {
            activationCode.ExpiresAt = DateTime.UtcNow.AddHours(12);
        }

        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();

        var emailURL = new UriBuilder
        {
            Scheme = HttpContext.Request.Scheme,
            Host = HttpContext.Request.Host.Host,
            Port = HttpContext.Request.Host.Port ?? -1,
            Path = "api/email",
        };

        using (var content = new FormUrlEncodedContent([
            new("email", user.Email),
            new("token", activationCode.Id.ToString("N")),
            new("locale", query.Locale),
        ])) { emailURL.Query = await content.ReadAsStringAsync(); }

        _backgroundJobClient.Enqueue<IEmailService>(emailService =>
            emailService.SendEmailUseTemplateAsync(
                email: user.Email,
                templateName: ActivationCodeActions.Register,
                parameters: new Dictionary<string, string>
                {
                    { "username", user.Name },
                    { "link", emailURL.ToString() }
                },
                query.Locale!
            )
        );

        return Ok(new BaseResponse.SuccessResponse(null));
    }

    [HttpPost("reset-password-permission")]
    public async Task<IActionResult> SendResetPasswordPermission(
        [FromQuery] LocaleQuery query,
        [FromForm] SendResetPasswordPermissionRequest request)
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
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.send-reset-password-permission.user-not-found"));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .FirstOrDefaultAsync(x => x.UserId == user.Id && x.Action.StartsWith(ActivationCodeActions.ResetPassword));

        if (activationCode == null)
        {
            activationCode = (await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id!,
                User = user,
                Action = ActivationCodeActions.ResetPassword,
                ExpiresAt = DateTime.UtcNow.AddHours(12)
            })).Entity;
        }
        else
        {
            activationCode.Action = ActivationCodeActions.ResetPassword;
            activationCode.ExpiresAt = DateTime.UtcNow.AddHours(12);
        }

        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();

        var emailURL = new UriBuilder
        {
            Scheme = HttpContext.Request.Scheme,
            Host = HttpContext.Request.Host.Host,
            Port = HttpContext.Request.Host.Port ?? -1,
            Path = "api/users/accept-reset-password",
        };

        _backgroundJobClient.Enqueue<IEmailService>(emailService =>
            emailService.SendEmailUseTemplateAsync(
                email: user.Email,
                templateName: ActivationCodeActions.ResetPassword,
                parameters: new Dictionary<string, string>
                {
                    { "username", user.Name },
                    { "token", activationCode.Id.ToString("N") },
                    { "link", emailURL.ToString() }
                },
                query.Locale!
            )
        );

        return Ok(new BaseResponse.SuccessResponse(null));
    }

    [HttpPost("accept-reset-password")]
    public async Task<IActionResult> AcceptPasswordResetting(
        [FromForm] AcceptPasswordResettingRequest request)
    {
        User? user = await DB.Users.FirstOrDefaultAsync(x => x.Name == request.Username);

        if (user == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.accept-reset-password.user-not-found"));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .FirstOrDefaultAsync(x => user.Id == x.UserId && x.Id == request.Token);

        if (activationCode == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.accept-reset-password.link"));
        }

        if (DateTime.UtcNow > activationCode.ExpiresAt)
        {
            DB.ActivationCodes.Remove(activationCode);
            await DB.SaveChangesAsync();
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.accept-reset-password.link"));
        }

        string[] actionInfo = activationCode.Action.Split(',');

        if (actionInfo[0] != ActivationCodeActions.ResetPassword)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.accept-reset-password.link"));
        }

        var linkToResetPassword = new UriBuilder
        {
            Scheme = HttpContext.Request.Scheme,
            Host = HttpContext.Request.Host.Host,
            Port = HttpContext.Request.Host.Port ?? -1,
            Path = "reset-password",
        };

        using (var content = new FormUrlEncodedContent([
            new("user", user.Name),
            new("token", activationCode.Id.ToString("N")),
        ])) { linkToResetPassword.Query = await content.ReadAsStringAsync(); }

        if (actionInfo.Length < 2)
        {
            activationCode.Action += ",accepted";
        }
        else
        {
            await DB.SaveChangesAsync();
            return Redirect(linkToResetPassword.ToString());
        }

        await DB.SaveChangesAsync();
        return Redirect(linkToResetPassword.ToString());
    }

    [HttpPut("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromForm] ResetPasswordRequest request)
    {
        if (!_passwordHandler.CheckFormat(request.NewPassword ?? ""))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.incorrect-password"));
        }

        User? user = await DB.Users.FirstOrDefaultAsync(x => x.Name == request.Username);

        if (user == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.user-not-found"));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .FirstOrDefaultAsync(x => user.Id == x.UserId && x.Id == request.Token);

        if (activationCode == null)
        {
            return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.link"));
        }

        if (DateTime.UtcNow > activationCode.ExpiresAt)
        {
            DB.ActivationCodes.Remove(activationCode);
            await DB.SaveChangesAsync();
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.link"));
        }

        string[] actionInfo = activationCode.Action.Split(',');

        if (actionInfo[0] != ActivationCodeActions.ResetPassword)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.link"));
        }

        if (actionInfo.Length < 2 || actionInfo[1] != "accepted")
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.link"));
        }

        user.PasswordHash = _passwordHandler.Hash(request.NewPassword!);
        user.LastActivityAt = DateTime.UtcNow;

        DB.ActivationCodes.Remove(activationCode);

        await DB.SaveChangesAsync();
        return Ok(new BaseResponse.SuccessResponse(null));
    }
}
