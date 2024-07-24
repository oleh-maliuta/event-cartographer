using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class AcceptPasswordResetingRequest
    {
        [Required(ErrorMessage = "A username is required.")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "A token is required.")]
        public string? Token { get; set; }
    }
}
