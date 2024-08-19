using EventCartographer.Server.Models;
using EventCartographer.Server.Requests;
using EventCartographer.Server.Responses;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EventCartographer.Server.Tools;
using EventCartographer.Server.Services.Email;
using System.Net;
using EventCartographer.Server.Attributes;
using EventCartographer.Server.Services.EntityFramework;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : BaseController
    {
        private readonly IEmailService _emailService;

        public UserController(DbApp db, IEmailService emailService) : base(db)
        {
            _emailService = emailService;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp(
            [FromHeader] string? language,
            [FromBody] SignUpRequest request)
        {
            if (await DB.Users.AnyAsync(x => x.Name == request.Username))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.same-username"));
            }

            if (await DB.Users.AnyAsync(x => x.Email == request.Email))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.same-email"));
            }

            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-up.password-not-confirmed"));
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
                        { "link", $"https://{HttpContext.Request.Host}/api/users/confirm-email/{WebUtility.UrlEncode(request.Email)}?token={token}" }
                    },
                    language ?? "en");
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
        public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
        {
            User? user = await DB.Users.SingleOrDefaultAsync(x => x.Name == request.Username);

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.username-or-password"));
            }

            if (!user.IsActivated)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.not-activated"));
            }

            if (!PasswordTool.Validate(request.Password!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.sign-in.username-or-password"));
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
        public async Task<IActionResult> UpdateUserInfo([FromBody] UpdateUserInfoRequest request)
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
        public async Task<IActionResult> UpdateUserPassword([FromBody] UpdateUserPasswordRequest request)
        {
            User? user = AuthorizedUser;

            if (!PasswordTool.Validate(request.OldPassword!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.update-user-password.invalid-old-password"));
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
            [FromHeader] string? language,
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
                        { "link", $"https://{HttpContext.Request.Host}/api/users/confirm-email/{WebUtility.UrlEncode(user.Email)}?token={token}" }
                    },
                    language ?? "en");
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
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
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
            [FromHeader] string? language,
            [FromBody] SendResetPasswordPermissionRequest request)
        {
            User? user = await DB.Users.SingleOrDefaultAsync(x => x.Name == request.Username);

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
                    language ?? "en");
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
        public async Task<IActionResult> AcceptPasswordResetting([FromForm] AcceptPasswordResettingRequest request)
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

            if (actionInfo.Length < 2)
            {
                activationCode.Action += ",accepted";
            }
            else
            {
                await DB.SaveChangesAsync();
                return Redirect($"https://{Constants.WebClientHost}/reset-password?user={WebUtility.UrlEncode(user.Name)}&token={activationCode.Code}");
            }

            await DB.SaveChangesAsync();
            return Redirect($"https://{Constants.WebClientHost}/reset-password?user={WebUtility.UrlEncode(user.Name)}&token={activationCode.Code}");
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (request.NewPassword != request.ConfirmNewPassword)
            {
                return BadRequest(new BaseResponse.ErrorResponse("http.controller-errors.user.reset-password.password-not-confirmed"));
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
            string email,
            [FromQuery(Name = "token")]
            string? token)
        {
            User? user = await DB.Users.SingleOrDefaultAsync(x => x.Email == WebUtility.UrlDecode(email));

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("There is no user with the email."));
            }

            ActivationCode? activationCode = await DB.ActivationCodes
                .SingleOrDefaultAsync(x => user.Id == x.UserId && x.Code == token);

            if (activationCode == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("The link is expired or unavailable."));
            }

            if (DateTime.UtcNow > activationCode.ExpiresAt)
            {
                DB.ActivationCodes.Remove(activationCode);
                await DB.SaveChangesAsync();
                return BadRequest(new BaseResponse.ErrorResponse("The link is expired or unavailable."));
            }

            string[] actionInfo = activationCode.Action.Split(',');

            switch (actionInfo[0])
            {
                case "confirm-registration":
                    user.IsActivated = true;
                    DB.ActivationCodes.Remove(activationCode);
                    break;
                case "change-email":
                    user.Email = actionInfo[1];
                    DB.ActivationCodes.Remove(activationCode);
                    break;
                default:
                    return BadRequest(new BaseResponse.ErrorResponse("Unknown action."));
            }

            user.LastActivityAt = DateTime.UtcNow;

            await DB.SaveChangesAsync();
            return Ok(new BaseResponse.SuccessResponse(null));
        }
    }
}
