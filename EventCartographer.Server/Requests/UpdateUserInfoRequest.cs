using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserInfoRequest
    {
        [Required]
        [StringLength(480, MinimumLength = 3)]
        public string Username { get; set; }
    }
}
