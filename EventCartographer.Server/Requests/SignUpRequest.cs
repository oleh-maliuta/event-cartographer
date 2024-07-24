using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignUpRequest
    {
        [Required(ErrorMessage = "A username is required.")]
        [MaxLength(100, ErrorMessage = "Too long username.")]
        [MinLength(3, ErrorMessage = "Too short username.")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "An email address is required.")]
        [MaxLength(320, ErrorMessage = "Too long email address.")]
        [MinLength(1, ErrorMessage = "Too short email address.")]
        [EmailAddress(ErrorMessage = "The email address is invalid.")]
        public string? Email { get; set; }
        [Required(ErrorMessage = "A password is required.")]
        [MaxLength(200, ErrorMessage = "Too long password.")]
        [MinLength(6, ErrorMessage = "Too short password.")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "A password confirmation is required.")]
        public string? ConfirmPassword { get; set; }
    }
}
