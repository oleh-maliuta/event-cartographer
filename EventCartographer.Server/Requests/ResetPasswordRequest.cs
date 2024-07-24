using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class ResetPasswordRequest
    {
        [Required(ErrorMessage = "A username is required.")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "A new password is required.")]
        [MaxLength(200, ErrorMessage = "Too long password.")]
        [MinLength(6, ErrorMessage = "Too short password.")]
        public string? NewPassword { get; set; }
        [Required(ErrorMessage = "The password confirmation is required.")]
        public string? ConfirmNewPassword { get; set; }
        [Required(ErrorMessage = "A token is required.")]
        public string? Token { get; set; }
    }
}
