using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests.Bodies;

public class AcceptPasswordResettingRequest
{
    [Required(ErrorMessage = "http.request-errors.accept-password-resetting.username.required")]
    public string? Username { get; set; }
    [Required(ErrorMessage = "http.request-errors.accept-password-resetting.token.required")]
    public Guid? Token { get; set; }
}
