using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignUpRequest
    {
        [Required]
        [StringLength(480, MinimumLength = 3)]
        public string Username { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [StringLength(480, MinimumLength = 6)]
        public string Password { get; set; }
        [Required]
        public string ConfirmPassword { get; set; }
    }
}
