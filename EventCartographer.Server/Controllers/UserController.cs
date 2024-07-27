using EventCartographer.Server.Models;
using EventCartographer.Server.Requests;
using EventCartographer.Server.Responses;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using EventCartographer.Server.Services.MongoDB;
using EventCartographer.Server.Tools;
using EventCartographer.Server.Services.Email;
using System.Net;
using EventCartographer.Server.Attributes;

namespace EventCartographer.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : BaseController
    {
        private readonly IEmailService _emailService;

        public UserController(MongoDbService db, IEmailService emailService) : base(db)
        {
            this._emailService = emailService;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
        {
            if (await DB.Users.Find(x => x.Name == request.Username).AnyAsync())
            {
                return BadRequest(new BaseResponse.ErrorResponse("There is a user with the same username!"));
            }

            if (await DB.Users.Find(x => x.Email == request.Email).AnyAsync())
            {
                return BadRequest(new BaseResponse.ErrorResponse("There is a user with the same email!"));
            }

            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The password is not confirmed!"));
            }

            string token = StringTool.RandomString(256);

            try
            {
                await _emailService.SendEmailUseTemplateAsync(
                    email: request.Email!,
                    templateName: "registration_confirm.html",
                    parameters: new Dictionary<string, string>
                    {
                        { "login", request.Username! },
                        { "link", $"https://{HttpContext.Request.Host}/api/users/confirm-email/{WebUtility.UrlEncode(request.Email)}?token={token}" }
                    });
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse.ErrorResponse(ex.Message));
            }

            User user = new()
            {
                Name = request.Username!,
                Email = request.Email!,
                PasswordHash = PasswordTool.Hash(request.Password!),
                IsActivated = false
            };

            await DB.Users.InsertOneAsync(user);

            DateTime regTime = DateTime.UtcNow;

            ActivationCode activationCode = new()
            {
                UserId = user.Id!,
                Code = token,
                Action = "confirm-registration",
                CreatedAt = regTime,
                ExpiresAt = regTime.AddHours(12)
            };

            await DB.ActivationCodes.InsertOneAsync(activationCode);

            return Ok(new UserResponse(user));
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
        {
            User? user = await DB.Users.Find(x => x.Name == request.Username).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("Invalid username or password!"));
            }

            if (!user.IsActivated)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("The user is not activated!"));
            }

            if (!PasswordTool.Validate(request.Password!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("Invalid username or password!"));
            }

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new(ClaimTypes.NameIdentifier, user.Id!),
                    new(ClaimTypes.Name, user.Name)
                ], CookieAuthenticationDefaults.AuthenticationScheme)));

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

            if (await DB.Users.Find(x => x.Name == request.Username).AnyAsync())
            {
                return BadRequest(new BaseResponse.ErrorResponse("There is a user with the same username!"));
            }

            user.Name = request.Username!;

            await DB.Users.ReplaceOneAsync(x => x.Id == user.Id, user);
            return Ok(new UserResponse(user));
        }

        [Authorized]
        [HttpPut("password")]
        public async Task<IActionResult> UpdateUserPassword([FromBody] UpdateUserPasswordRequest request)
        {
            User? user = AuthorizedUser;

            if (!PasswordTool.Validate(request.OldPassword!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("Invalid old password!"));
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The password is not confirmed!"));
            }

            user.PasswordHash = PasswordTool.Hash(request.NewPassword!);

            await DB.Users.ReplaceOneAsync(x => x.Id == user.Id, user);
            return Ok(new UserResponse(user));
        }

        [Authorized]
        [HttpPut("email")]
        public async Task<IActionResult> ChangeEmail([FromBody] UpdateUserEmailRequest request)
        {
            User user = AuthorizedUser;

            if (user.Email == request.Email)
            {
                return BadRequest(new BaseResponse.ErrorResponse("This is your current email."));
            }

            if (await DB.Users.Find(x => x.Email == request.Email).AnyAsync())
            {
                return BadRequest(new BaseResponse.ErrorResponse("There is a user with the same email!"));
            }

            if (!PasswordTool.Validate(request.Password!, user.PasswordHash))
            {
                return BadRequest(new BaseResponse.ErrorResponse("Invalid password!"));
            }

            string token = StringTool.RandomString(256);

            try
            {
                await _emailService.SendEmailUseTemplateAsync(
                    email: request.Email!,
                    templateName: "change_email_confirm.html",
                    parameters: new Dictionary<string, string>
                    {
                        { "login", user.Name },
                        { "link", $"https://{HttpContext.Request.Host}/api/users/confirm-email/{WebUtility.UrlEncode(user.Email)}?token={token}" }
                    });
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse.ErrorResponse(ex.Message));
            }

            DateTime activationTime = DateTime.UtcNow;
            ActivationCode activationCode = new()
            {
                UserId = user.Id!,
                Code = token,
                Action = $"change-email,{request.Email}",
                CreatedAt = activationTime,
                ExpiresAt = activationTime.AddHours(12)
            };

            await DB.ActivationCodes.InsertOneAsync(activationCode);

            return Ok(new BaseResponse.SuccessResponse("Email is sent."));
        }

        [Authorized]
        [HttpDelete]
        public async Task<IActionResult> DeleteUser()
        {
            User? user = AuthorizedUser;

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await DB.ActivationCodes.DeleteManyAsync(x => x.UserId == user.Id);
            await DB.Markers.DeleteManyAsync(x => x.UserId == user.Id);
            await DB.Users.DeleteOneAsync(x => x.Id == user.Id);

            return Ok(new BaseResponse.SuccessResponse(null));
        }

        [HttpPost("reset-password-permission")]
        public async Task<IActionResult> SendResetPasswordPermission(
            [FromBody] SendResetPasswordPermissionRequest request)
        {
            User? user = await DB.Users.Find(x => x.Name == request.Username)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("User not found!"));
            }

            IFindFluent<ActivationCode, ActivationCode> existingCodes = DB.ActivationCodes
                .Find(x =>
                    x.UserId == user.Id &&
                    x.Action.StartsWith("reset-password-permission") &&
                    x.ExpiresAt > DateTime.UtcNow);

            if (existingCodes.Any())
            {
                return BadRequest(new BaseResponse.ErrorResponse("You have got the permission already!"));
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
                        { "link", $"https://{HttpContext.Request.Host.Host}:7176/api/users/accept-reset-password" }
                    });
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse.ErrorResponse(ex.Message));
            }

            DateTime resTime = DateTime.UtcNow;

            ActivationCode activationCode = new()
            {
                UserId = user.Id!,
                Code = token,
                Action = "reset-password-permission",
                CreatedAt = resTime,
                ExpiresAt = resTime.AddHours(12)
            };

            await DB.ActivationCodes.InsertOneAsync(activationCode);

            return Ok(new BaseResponse.SuccessResponse("Email is sent."));
        }

        [HttpPost("accept-reset-password")]
        public async Task<IActionResult> AcceptPasswordReseting([FromForm] AcceptPasswordResetingRequest request)
        {
            User? user = await DB.Users.Find(x => x.Name == request.Username).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("User not found!"));
            }

            ActivationCode? activationCode = await DB.ActivationCodes
                .Find(x => user.Id == x.UserId && x.Code == request.Token)
                .FirstOrDefaultAsync();

            if (activationCode == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            if (DateTime.UtcNow > activationCode.ExpiresAt)
            {
                await DB.ActivationCodes.DeleteOneAsync(x => x.Id == activationCode.Id);
                return BadRequest(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            string[] actionInfo = activationCode.Action.Split(',');

            if (actionInfo[0] != "reset-password-permission")
            {
                return BadRequest(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            if (actionInfo.Length < 2)
            {
                activationCode.Action += ",accepted";
            }
            else
            {
                return Redirect($"https://localhost:5173/reset-password?user={WebUtility.UrlEncode(user.Name)}&token={activationCode.Code}");
            }

            await DB.ActivationCodes.ReplaceOneAsync(x => x.Id == activationCode.Id, activationCode);

            return Redirect($"https://localhost:5173/reset-password?user={WebUtility.UrlEncode(user.Name)}&token={activationCode.Code}");
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (request.NewPassword != request.ConfirmNewPassword)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The password is not confirmed!"));
            }

            User? user = await DB.Users.Find(x => x.Name == request.Username).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("User not found!"));
            }

            ActivationCode? activationCode = await DB.ActivationCodes
                .Find(x => user.Id == x.UserId && x.Code == request.Token)
                .FirstOrDefaultAsync();

            if (activationCode == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            if (DateTime.UtcNow > activationCode.ExpiresAt)
            {
                await DB.ActivationCodes.DeleteOneAsync(x => x.Id == activationCode.Id);
                return BadRequest(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            string[] actionInfo = activationCode.Action.Split(',');

            if (actionInfo[0] != "reset-password-permission")
            {
                return BadRequest(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            if (actionInfo.Length < 2 || actionInfo[1] != "accepted")
            {
                return BadRequest(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            user.PasswordHash = PasswordTool.Hash(request.NewPassword!);

            await DB.Users.ReplaceOneAsync(x => x.Id == user.Id, user);
            await DB.ActivationCodes.DeleteOneAsync(x => x.Id == activationCode.Id);

            return Ok(new BaseResponse.SuccessResponse("The password is changed!"));
        }

        [HttpGet("confirm-email/{email}")]
        public async Task<IActionResult> ConfirmEmail(
            string email,
            [FromQuery(Name = "token")]
            string? token)
        {
            User? user = await DB.Users
                .Find(x => x.Email == WebUtility.UrlDecode(email))
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("There is no user with the email!"));
            }

            ActivationCode? activationCode = await DB.ActivationCodes
                .Find(x => user.Id == x.UserId && x.Code == token)
                .FirstOrDefaultAsync();

            if (activationCode == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("The link is expired or unavailable!"));
            }

            if (DateTime.UtcNow > activationCode.ExpiresAt)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The link is expired!"));
            }

            string[] actionInfo = activationCode.Action.Split(',');

            switch (actionInfo[0])
            {
                case "confirm-registration":
                    user.IsActivated = true;
                    await DB.Users.ReplaceOneAsync(x => x.Id == user.Id, user);
                    await DB.ActivationCodes.DeleteOneAsync(x => x.Id == activationCode.Id);
                    break;
                case "change-email":
                    user.Email = actionInfo[1];
                    await DB.Users.ReplaceOneAsync(x => x.Id == user.Id, user);
                    await DB.ActivationCodes.DeleteOneAsync(x => x.Id == activationCode.Id);
                    break;
                default:
                    return BadRequest(new BaseResponse.ErrorResponse("Unknown action"));
            }

            return Ok(new BaseResponse.SuccessResponse("Confirmed"));
        }
    }
}
