using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class ResetPasswordRequest
    {
        [Required]
        public string UserId { get; set; }
        [Required]
        public string NewPassword { get; set; }
        [Required]
        public string ConfirmNewPassword { get; set; }
        [Required]
        public string Token { get; set; }
    }
}
