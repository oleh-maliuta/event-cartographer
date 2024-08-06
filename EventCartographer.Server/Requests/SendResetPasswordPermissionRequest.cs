using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SendResetPasswordPermissionRequest
    {
        [Required(ErrorMessage = "http.request-errors.send-reset-password-permission.username.required")]
        public string? Username { get; set; }
    }
}
