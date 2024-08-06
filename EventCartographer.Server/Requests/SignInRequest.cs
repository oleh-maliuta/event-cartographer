using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignInRequest
    {
        [Required(ErrorMessage = "http.request-errors.sign-in.username.required")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "http.request-errors.sign-in.password.required")]
        public string? Password { get; set; }
    }
}
