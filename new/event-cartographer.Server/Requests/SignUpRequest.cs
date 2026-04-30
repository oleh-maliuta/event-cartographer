using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignUpRequest
    {
        [Required(ErrorMessage = "http.request-errors.sign-up.username.required")]
        [MaxLength(100, ErrorMessage = "http.request-errors.sign-up.username.max-length")]
        [MinLength(3, ErrorMessage = "http.request-errors.sign-up.username.min-length")]
        [RegularExpression("^[^@]*$", ErrorMessage = "http.request-errors.sign-up.username.format")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "http.request-errors.sign-up.email.required")]
        [MaxLength(320, ErrorMessage = "http.request-errors.sign-up.email.max-length")]
        [EmailAddress(ErrorMessage = "http.request-errors.sign-up.email.email-address")]
        public string? Email { get; set; }
        [Required(ErrorMessage = "http.request-errors.sign-up.password.required")]
        [MaxLength(200, ErrorMessage = "http.request-errors.sign-up.password.max-length")]
        [MinLength(6, ErrorMessage = "http.request-errors.sign-up.password.min-length")]
        public string? Password { get; set; }
    }
}
