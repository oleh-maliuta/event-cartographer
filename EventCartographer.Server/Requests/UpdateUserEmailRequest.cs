using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserEmailRequest
    {
        [Required]
        public string Password { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
