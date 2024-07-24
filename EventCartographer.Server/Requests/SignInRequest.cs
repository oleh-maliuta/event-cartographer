using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignInRequest
    {
        [Required(ErrorMessage = "A username is required.")]
        public string Username { get; set; }
        [Required(ErrorMessage = "A password is required.")]
        public string Password { get; set; }
    }
}
