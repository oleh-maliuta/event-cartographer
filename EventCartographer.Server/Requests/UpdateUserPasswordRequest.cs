
using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserPasswordRequest
    {
        [Required(ErrorMessage = "http.request-errors.update-user-password.old-password.required")]
        public string? OldPassword { get; set; }
        [Required(ErrorMessage = "http.request-errors.update-user-password.new-password.required")]
        [MaxLength(200, ErrorMessage = "http.request-errors.update-user-password.new-password.max-length")]
        [MinLength(6, ErrorMessage = "http.request-errors.update-user-password.new-password.min-length")]
        public string? NewPassword { get; set; }
        [Required(ErrorMessage = "http.request-errors.update-user-password.confirm-password.required")]
        public string? ConfirmPassword { get; set; }
    }
}
