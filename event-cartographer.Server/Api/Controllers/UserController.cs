using EventCartographer.Api.Models.Responses;
using EventCartographer.Api.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventCartographer.Services.Email;
using EventCartographer.Api.Models.Requests.Bodies;
using EventCartographer.Api.Models.Requests.Queries;
using EventCartographer.Domain.Entities;
using EventCartographer.Infrastructure.Database;
using EventCartographer.Application.Common.Interfaces;

namespace EventCartographer.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(
        ApplicationDbContext db,
        IEmailService emailService,
        IPasswordHandler passwordHandler) : BaseController(db)
{
    private readonly IEmailService _emailService = emailService;
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

        if (await DB.ActivationCodes.Where(x => x.UserId == user.Id && x.Action.StartsWith("change-email")).AnyAsync())
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.already-exists"));
        }

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

        ActivationCode code = (await DB.ActivationCodes.AddAsync(new()
        {
            UserId = user.Id!,
            User = user,
            Action = $"change-email,{request.Email}",
            ExpiresAt = DateTime.UtcNow.AddHours(12)
        })).Entity;

        await DB.SaveChangesAsync();

        try
        {
            var emailURL = new UriBuilder
            {
                Scheme = HttpContext.Request.Scheme,
                Host = HttpContext.Request.Host.Host,
                Port = HttpContext.Request.Host.Port ?? -1,
                Path = "api/email",
            };

            using (var content = new FormUrlEncodedContent([
                    new("email", user.Email),
                    new("token", code.Id.ToString("N")),
                    new("locale", query.Locale),
                ])) { emailURL.Query = await content.ReadAsStringAsync(); }

            await _emailService.SendEmailUseTemplateAsync(
                email: request.Email!,
                templateName: "change_email_confirm.html",
                parameters: new Dictionary<string, string>
                {
                        { "username", user.Name },
                        { "link", emailURL.ToString() }
                },
                query.Locale!);
        }
        catch (Exception)
        {
            return StatusCode(500, new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.email-error"));
        }

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

        if (await DB.ActivationCodes.Where(x => x.UserId == user.Id && x.Action == "delete-user").AnyAsync())
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.delete-user.already-exists"));
        }

        ActivationCode code = (await DB.ActivationCodes.AddAsync(new()
        {
            UserId = user.Id!,
            User = user,
            Action = "delete-user",
            ExpiresAt = DateTime.UtcNow.AddHours(12)
        })).Entity;

        await DB.SaveChangesAsync();

        try
        {
            var emailURL = new UriBuilder
            {
                Scheme = HttpContext.Request.Scheme,
                Host = HttpContext.Request.Host.Host,
                Port = HttpContext.Request.Host.Port ?? -1,
                Path = "api/email",
            };

            using (var content = new FormUrlEncodedContent([
                new("email", user.Email),
                    new("token", code.Id.ToString("N")),
                    new("locale", query.Locale),
                ])) { emailURL.Query = await content.ReadAsStringAsync(); }

            await _emailService.SendEmailUseTemplateAsync(
                email: user.Email,
                templateName: "delete_account_confirm.html",
                parameters: new Dictionary<string, string>
                {
                        { "username", user.Name },
                        { "link", emailURL.ToString() }
                },
                query.Locale!);
        }
        catch (Exception)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.email-error"));
        }

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
            .FirstOrDefaultAsync(x => user.Id == x.UserId && x.Action == "confirm-registration");

        if (activationCode == null)
        {
            activationCode = (await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id,
                User = user,
                Action = "confirm-registration",
                ExpiresAt = DateTime.UtcNow.AddHours(12)
            })).Entity;
        }
        else
        {
            activationCode.ExpiresAt = DateTime.UtcNow.AddHours(12);
        }

        user.LastActivityAt = DateTime.UtcNow;

        await DB.SaveChangesAsync();

        try
        {
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

            await _emailService.SendEmailUseTemplateAsync(
                email: user.Email,
                templateName: "registration_confirm.html",
                parameters: new Dictionary<string, string>
                {
                        { "username", user.Name },
                        { "link", emailURL.ToString() }
                },
                query.Locale!
            );
        }
        catch (Exception)
        {
            return StatusCode(500, new BaseResponse.ErrorResponse("http.controller-errors.user.resend-email-confirmation.email-error"));
        }

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

        if (await DB.ActivationCodes
            .AnyAsync(x =>
                x.UserId == user.Id &&
                x.Action.StartsWith("reset-password-permission") &&
                x.ExpiresAt > DateTime.UtcNow))
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.send-reset-password-permission.have-permission"));
        }

        ActivationCode code = (await DB.ActivationCodes.AddAsync(new()
        {
            UserId = user.Id!,
            User = user,
            Action = "reset-password-permission",
            ExpiresAt = DateTime.UtcNow.AddHours(12)
        })).Entity;

        await DB.SaveChangesAsync();

        try
        {
            var emailURL = new UriBuilder
            {
                Scheme = HttpContext.Request.Scheme,
                Host = HttpContext.Request.Host.Host,
                Port = HttpContext.Request.Host.Port ?? -1,
                Path = "api/users/accept-reset-password",
            };

            await _emailService.SendEmailUseTemplateAsync(
                email: user.Email,
                templateName: "reset_password_permission.html",
                parameters: new Dictionary<string, string>
                {
                        { "username", user.Name },
                        { "token", code.Id.ToString("N") },
                        { "link", emailURL.ToString() }
                },
                query.Locale!);
        }
        catch (Exception)
        {
            return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.send-reset-password-permission.email-error"));
        }

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

        if (actionInfo[0] != "reset-password-permission")
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

        if (actionInfo[0] != "reset-password-permission")
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
