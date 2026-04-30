using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SendResetPasswordPermissionRequest
    {
        [Required(ErrorMessage = "http.request-errors.send-reset-password-permission.username-or-email.required")]
        public string? UsernameOrEmail { get; set; }
    }
}
