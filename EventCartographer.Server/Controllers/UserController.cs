﻿using EventCartographer.Server.Models;
using EventCartographer.Server.Requests;
using EventCartographer.Server.Responses;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EventCartographer.Server.Services.Email;
using System.Net;
using EventCartographer.Server.Attributes;
using EventCartographer.Server.Services.EntityFramework;
using Microsoft.EntityFrameworkCore;
using EventCartographer.Server.Utils;
using EventCartographer.Server.Services.Localization;

namespace EventCartographer.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : BaseController
    {
        private readonly IEmailService _emailService;
        private readonly ILocalizationService _localizationService;

        public UserController(
            DbApp db,
            IEmailService emailService,
            ILocalizationService localizationService) : base(db)
        {
            _emailService = emailService;
            _localizationService = localizationService;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp(
            [FromQuery] string? locale,
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

            if (!PasswordTool.CheckFormat(request.Password ?? ""))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.incorrect-password"));
            }

            string token = StringTool.RandomString(256);

            try
            {
                await _emailService.SendEmailUseTemplateAsync(
                    email: request.Email!,
                    templateName: "registration_confirm.html",
                    parameters: new Dictionary<string, string>
                    {
                        { "username", request.Username! },
                        { "link", $"https://{HttpContext.Request.Host}/api/users/confirm-email/{WebUtility.UrlEncode(request.Email)}?token={token}&locale={locale}" }
                    },
                    locale ?? "en");
            }
            catch (Exception)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.email-error"));
            }

            User user = (await DB.Users.AddAsync(new()
            {
                Name = request.Username!,
                Email = request.Email!,
                PasswordHash = PasswordTool.Hash(request.Password!),
                PermissionToDeletePastEvents = false,
                IsActivated = false,
                LastActivityAt = DateTime.UtcNow
            })).Entity;

            await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id,
                User = user,
                Code = token,
                Action = "confirm-registration",
                ExpiresAt = DateTime.UtcNow.AddHours(12)
            });

            await DB.SaveChangesAsync();
            return Ok(new UserResponse(user));
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn(
            [FromForm] SignInRequest request)
        {
            User? user = await DB.Users.SingleOrDefaultAsync(
                x => x.Name == request.UsernameOrEmail || x.Email == request.UsernameOrEmail);

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.username-email-or-password"));
            }

            if (!user.IsActivated)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.not-activated"));
            }

            if (!PasswordTool.Validate(request.Password!, user.PasswordHash))
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
            [FromBody] UpdateUserPasswordRequest request)
        {
            User? user = AuthorizedUser;

            if (!PasswordTool.Validate(request.OldPassword!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-password.invalid-old-password"));
            }

            if (!PasswordTool.CheckFormat(request.NewPassword ?? ""))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-password.incorrect-password"));
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-password.password-not-confirmed"));
            }

            user.PasswordHash = PasswordTool.Hash(request.NewPassword!);
            user.LastActivityAt = DateTime.UtcNow;

            await DB.SaveChangesAsync();
            return Ok(new UserResponse(user));
        }

        [Authorized]
        [HttpPut("email")]
        public async Task<IActionResult> UpdateUserEmail(
            [FromQuery] string? locale,
            [FromBody] UpdateUserEmailRequest request)
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

            if (!PasswordTool.Validate(request.Password!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.invalid-password"));
            }

            string token = StringTool.RandomString(256);

            try
            {
                await _emailService.SendEmailUseTemplateAsync(
                    email: request.Email!,
                    templateName: "change_email_confirm.html",
                    parameters: new Dictionary<string, string>
                    {
                        { "username", user.Name },
                        { "link", $"https://{HttpContext.Request.Host}/api/users/confirm-email/{WebUtility.UrlEncode(user.Email)}?token={token}&locale={locale}" }
                    },
                    locale ?? "en");
            }
            catch (Exception)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-email.email-error"));
            }

            await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id!,
                User = user,
                Code = token,
                Action = $"change-email,{request.Email}",
                ExpiresAt = DateTime.UtcNow.AddHours(12)
            });

            await DB.SaveChangesAsync();
            return Ok(new BaseResponse.SuccessResponse(null));
        }

        [Authorized]
        [HttpPut("delete")]
        public async Task<IActionResult> DeleteUser(
            [FromBody] DeleteUserRequest request)
        {
            User? user = AuthorizedUser;

            if (!PasswordTool.Validate(request.Password!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.delete-user.invalid-password"));
            }

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            DB.Users.Remove(user);

            await DB.SaveChangesAsync();
            return Ok(new BaseResponse.SuccessResponse(null));
        }

        [HttpPost("reset-password-permission")]
        public async Task<IActionResult> SendResetPasswordPermission(
            [FromQuery] string? locale,
            [FromForm] SendResetPasswordPermissionRequest request)
        {
            User? user = await DB.Users.SingleOrDefaultAsync(
                x => x.Name == request.UsernameOrEmail || x.Email == request.UsernameOrEmail);

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

            string token = StringTool.RandomString(256);

            try
            {
                await _emailService.SendEmailUseTemplateAsync(
                    email: user.Email,
                    templateName: "reset_password_permission.html",
                    parameters: new Dictionary<string, string>
                    {
                        { "username", user.Name },
                        { "token", token },
                        { "link", $"https://{HttpContext.Request.Host}/api/users/accept-reset-password" }
                    },
                    locale ?? "en");
            }
            catch (Exception)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.send-reset-password-permission.email-error"));
            }

            DateTime resTime = DateTime.UtcNow;

            await DB.ActivationCodes.AddAsync(new()
            {
                UserId = user.Id!,
                User = user,
                Code = token,
                Action = "reset-password-permission",
                ExpiresAt = resTime.AddHours(12)
            });

            await DB.SaveChangesAsync();
            return Ok(new BaseResponse.SuccessResponse(null));
        }

        [HttpPost("accept-reset-password")]
        public async Task<IActionResult> AcceptPasswordResetting(
            [FromForm] AcceptPasswordResettingRequest request)
        {
            User? user = await DB.Users.SingleOrDefaultAsync(x => x.Name == request.Username);

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.accept-reset-password.user-not-found"));
            }

            ActivationCode? activationCode = await DB.ActivationCodes
                .SingleOrDefaultAsync(x => user.Id == x.UserId && x.Code == request.Token);

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

            string linkToResetPassword = $"https://{Constants.WebClientHost}/reset-password" +
                $"?user={WebUtility.UrlEncode(user.Name)}" +
                $"&token={activationCode.Code}";

            if (actionInfo.Length < 2)
            {
                activationCode.Action += ",accepted";
            }
            else
            {
                await DB.SaveChangesAsync();
                return Redirect(linkToResetPassword);
            }

            await DB.SaveChangesAsync();
            return Redirect(linkToResetPassword);
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword(
            [FromForm] ResetPasswordRequest request)
        {
            if (!PasswordTool.CheckFormat(request.NewPassword ?? ""))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.incorrect-password"));
            }

            User? user = await DB.Users.SingleOrDefaultAsync(x => x.Name == request.Username);

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.user-not-found"));
            }

            ActivationCode? activationCode = await DB.ActivationCodes
                .SingleOrDefaultAsync(x => user.Id == x.UserId && x.Code == request.Token);

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

            user.PasswordHash = PasswordTool.Hash(request.NewPassword!);
            user.LastActivityAt = DateTime.UtcNow;

            DB.ActivationCodes.Remove(activationCode);

            await DB.SaveChangesAsync();
            return Ok(new BaseResponse.SuccessResponse(null));
        }

        [HttpGet("confirm-email/{email}")]
        public async Task<IActionResult> ConfirmEmail(
            [FromRoute] string email,
            [FromQuery(Name = "locale")] string? locale,
            [FromQuery(Name = "token")] string? token)
        {
            User? user = await DB.Users.SingleOrDefaultAsync(
                x => x.Email == WebUtility.UrlDecode(email));

            if (user == null)
            {
                return MessageContentResult(
                    false,
                    _localizationService.GetString("fail", locale ?? "en"),
                    _localizationService.GetString("user-not-found", locale ?? "en"));
            }

            ActivationCode? activationCode = await DB.ActivationCodes
                .SingleOrDefaultAsync(x => user.Id == x.UserId && x.Code == token);

            if (activationCode == null)
            {
                return MessageContentResult(
                    false,
                    _localizationService.GetString("fail", locale ?? "en"),
                    _localizationService.GetString("link-issue", locale ?? "en"));
            }

            if (DateTime.UtcNow > activationCode.ExpiresAt)
            {
                DB.ActivationCodes.Remove(activationCode);
                await DB.SaveChangesAsync();
                return MessageContentResult(
                    false,
                    _localizationService.GetString("fail", locale ?? "en"),
                    _localizationService.GetString("link-issue", locale ?? "en"));
            }

            string[] actionInfo = activationCode.Action.Split(',');
            string message;

            switch (actionInfo[0])
            {
                case "confirm-registration":
                    user.IsActivated = true;
                    DB.ActivationCodes.Remove(activationCode);
                    message = _localizationService.GetString("registration-completed", locale ?? "en");
                    break;
                case "change-email":
                    user.Email = actionInfo[1];
                    DB.ActivationCodes.Remove(activationCode);
                    message = _localizationService.GetString("email-confirmed", locale ?? "en");
                    break;
                default:
                    return MessageContentResult(
                        false,
                        _localizationService.GetString("fail", locale ?? "en"),
                        _localizationService.GetString("unknown-action", locale ?? "en"));
            }

            user.LastActivityAt = DateTime.UtcNow;

            await DB.SaveChangesAsync();
            return MessageContentResult(
                true,
                _localizationService.GetString("success", locale ?? "en"),
                _localizationService.GetString(message, locale ?? "en"));
        }
    }
}
