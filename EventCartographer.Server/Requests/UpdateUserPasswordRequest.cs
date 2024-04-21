
using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserPasswordRequest
    {
        [Required]
        public string OldPassword { get; set; }
        [Required]
        [StringLength(480)]
        public string NewPassword { get; set; }
        [Required]
        public string ConfirmPassword { get; set; }
    }
}
