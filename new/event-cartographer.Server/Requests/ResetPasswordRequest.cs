using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class ResetPasswordRequest
    {
        [Required(ErrorMessage = "http.request-errors.reset-password.username.required")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "http.request-errors.reset-password.new-password.required")]
        [MaxLength(200, ErrorMessage = "http.request-errors.reset-password.new-password.max-length")]
        [MinLength(6, ErrorMessage = "http.request-errors.reset-password.new-password.min-length")]
        public string? NewPassword { get; set; }
        [Required(ErrorMessage = "http.request-errors.reset-password.token.required")]
        public string? Token { get; set; }
    }
}
