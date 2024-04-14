using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class SignUpRequest
    {
        [Required]
        [StringLength(480, MinimumLength = 3)]
        public string Name { get; set; }
        [Required]
        [StringLength(480, MinimumLength = 6)]
        public string Password { get; set; }
        [Required]
        public string ConfirmPassword { get; set; }
    }
}
