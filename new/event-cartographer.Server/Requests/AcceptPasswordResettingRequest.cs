using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class AcceptPasswordResettingRequest
    {
        [Required(ErrorMessage = "http.request-errors.accept-password-resetting.username.required")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "http.request-errors.accept-password-resetting.token.required")]
        public string? Token { get; set; }
    }
}
