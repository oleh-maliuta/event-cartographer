using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignUpRequest
    {
        [Required(ErrorMessage = "http.request-errors.sign-up.username.required")]
        [MaxLength(100, ErrorMessage = "http.request-errors.sign-up.username.max-length")]
        [MinLength(3, ErrorMessage = "http.request-errors.sign-up.username.min-length")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "http.request-errors.sign-up.email.required")]
        [MaxLength(320, ErrorMessage = "http.request-errors.sign-up.email.max-length")]
        [MinLength(1, ErrorMessage = "http.request-errors.sign-up.email.min-length")]
        [EmailAddress(ErrorMessage = "http.request-errors.sign-up.email.email-address")]
        public string? Email { get; set; }
        [Required(ErrorMessage = "http.request-errors.sign-up.password.required")]
        [MaxLength(200, ErrorMessage = "http.request-errors.sign-up.password.max-length")]
        [MinLength(6, ErrorMessage = "http.request-errors.sign-up.password.min-length")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "http.request-errors.sign-up.confirm-password.required")]
        public string? ConfirmPassword { get; set; }
    }
}
