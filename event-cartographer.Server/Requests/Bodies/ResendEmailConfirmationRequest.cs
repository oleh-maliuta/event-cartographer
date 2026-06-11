using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests.Bodies;

public class ResendEmailConfirmationRequest
{
    [Required(ErrorMessage = "http.request-errors.resend-email-confirmation.username-or-email.required")]
    public string? UsernameOrEmail { get; set; }
}
