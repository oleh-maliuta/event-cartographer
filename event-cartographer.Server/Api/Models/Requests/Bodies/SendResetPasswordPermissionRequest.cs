using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Api.Models.Requests.Bodies;

public class SendResetPasswordPermissionRequest
{
    [Required(ErrorMessage = "http.request-errors.send-reset-password-permission.username-or-email.required")]
    public string? UsernameOrEmail { get; set; }
}
