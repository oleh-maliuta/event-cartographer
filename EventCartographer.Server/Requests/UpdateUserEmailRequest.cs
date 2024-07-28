using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserEmailRequest
    {
        [Required(ErrorMessage = "A password is required.")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "A new email address is required.")]
        [MaxLength(320, ErrorMessage = "Too long email address.")]
        [MinLength(1, ErrorMessage = "Too short email address.")]
        [EmailAddress(ErrorMessage = "The new email address is invalid.")]
        public string? Email { get; set; }
    }
}
