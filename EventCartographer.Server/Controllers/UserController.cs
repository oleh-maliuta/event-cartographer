using EventCartographer.Server.Models;
using EventCartographer.Server.Requests;
using EventCartographer.Server.Responses;
using EventCartographer.Server.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;

namespace EventCartographer.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : BaseController
    {
        public UserController(MongoDbService service) : base(service) { }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(DB.Users.Find(x => true).ToList());
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp(SignUpRequest request)
        {
            if (DB.Users.Find(x => x.Name == request.Name).Any())
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
                Name = request.Name,
                Password = request.Password
            };

            await DB.Users.InsertOneAsync(user);

            return Ok(new UserResponse(user));
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
        {
            User? user = await DB.Users.Find(x => x.Name == request.Name).SingleOrDefaultAsync();

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
                new(ClaimTypes.NameIdentifier, user.Id!.ToString()),
                new(ClaimTypes.Name, user.Name)
            ], CookieAuthenticationDefaults.AuthenticationScheme)));

            return Ok(new UserResponse(user));
        }

        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
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
}
