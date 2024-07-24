using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserEmailRequest
    {
        [Required(ErrorMessage = "A password is required.")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "A new email address is required.")]
        [EmailAddress(ErrorMessage = "The new email address is invalid.")]
        public string? Email { get; set; }
    }
}
