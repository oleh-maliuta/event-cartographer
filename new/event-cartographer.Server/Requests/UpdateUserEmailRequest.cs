using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserEmailRequest
    {
        [Required(ErrorMessage = "http.request-errors.update-user-email.password.required")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "http.request-errors.update-user-email.email.required")]
        [MaxLength(320, ErrorMessage = "http.request-errors.update-user-email.email.max-length")]
        [MinLength(1, ErrorMessage = "http.request-errors.update-user-email.email.min-length")]
        [EmailAddress(ErrorMessage = "http.request-errors.update-user-email.email.email-address")]
        public string? Email { get; set; }
    }
}
