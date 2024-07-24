using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SendResetPasswordPermissionRequest
    {
        [Required(ErrorMessage = "A username is required.")]
        public string? Username { get; set; }
    }
}
