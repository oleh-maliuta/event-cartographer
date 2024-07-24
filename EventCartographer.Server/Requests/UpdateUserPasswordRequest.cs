
using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserPasswordRequest
    {
        [Required(ErrorMessage = "The old password is required.")]
        public string? OldPassword { get; set; }
        [Required(ErrorMessage = "A new password is required.")]
        [MaxLength(200, ErrorMessage = "Too long new password.")]
        [MinLength(6, ErrorMessage = "Too short new password.")]
        public string? NewPassword { get; set; }
        [Required(ErrorMessage = "The new password confirmation is required.")]
        public string? ConfirmPassword { get; set; }
    }
}
