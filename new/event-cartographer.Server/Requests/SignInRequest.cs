using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignInRequest
    {
        [Required(ErrorMessage = "http.request-errors.sign-in.username-or-email.required")]
        public string? UsernameOrEmail { get; set; }
        [Required(ErrorMessage = "http.request-errors.sign-in.password.required")]
        public string? Password { get; set; }
    }
}
