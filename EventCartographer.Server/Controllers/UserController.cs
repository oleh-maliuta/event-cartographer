using EventCartographer.Server.Models;
using EventCartographer.Server.Requests;
using EventCartographer.Server.Responses;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using EventCartographer.Server.Services.MongoDB;

namespace EventCartographer.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : BaseController
    {
        public UserController(MongoDbService db) : base(db) {}

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
        {
            if (await DB.Users.Find(x => x.Name == request.Username).AnyAsync())
            {
                return BadRequest(new BaseResponse.ErrorResponse("There is a user with the same username!"));
            }

            if (request.Password.Length < 6)
            {
                return BadRequest(new BaseResponse.ErrorResponse("Too short password!"));
            }

            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new BaseResponse.ErrorResponse("The password is not confirmed!"));
            }

            User user = new()
            {
                Name = request.Username,
                Password = request.Password
            };

            await DB.Users.InsertOneAsync(user);

            return Ok(new UserResponse(user));
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
        {
            User? user = await DB.Users.Find(x => x.Name == request.Username).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new BaseResponse.ErrorResponse("Invalid username!"));
            }

            if (request.Password != user.Password)
            {
                return BadRequest(new BaseResponse.ErrorResponse("Invalid password!"));
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

        [HttpGet("self")]
        public IActionResult SelfInfo()
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            return Ok(new UserResponse(AuthorizedUser));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUserInfo([FromBody] UpdateUserInfoRequest request)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            User user = AuthorizedUser;

            if (await DB.Users.Find(x => x.Name == request.Name).AnyAsync())
            {
                return BadRequest(new BaseResponse.ErrorResponse("There is a user with the same username!"));
            }

            user.Name = request.Name;

            await DB.Users.ReplaceOneAsync(x => x.Id == user.Id, user);
            return Ok(new UserResponse(user));
        }

        [HttpPut("password")]
        public async Task<IActionResult> UpdateUserPassword([FromBody] string[] request)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            User? user = AuthorizedUser;

            if (request[0].Length < 6)
            {
                return BadRequest(new BaseResponse.ErrorResponse("Too short password!"));
            }

            if (request[0] != request[1])
            {
                return BadRequest(new BaseResponse.ErrorResponse("The password is not confirmed!"));
            }

            user.Password = request[0];

            await DB.Users.ReplaceOneAsync(x => x.Id == user.Id, user);
            return Ok(new UserResponse(user));
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteUser()
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new BaseResponse.ErrorResponse("Unauthorized!"));
            }

            User? user = AuthorizedUser;

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await DB.Markers.DeleteManyAsync(x => x.UserId == user.Id);
            await DB.Users.DeleteOneAsync(x => x.Id == user.Id);

            return Ok(new BaseResponse.SuccessResponse(null));
        }
    }
}
