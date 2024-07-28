using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class DeleteUserRequest
    {
        [Required(ErrorMessage = "A password is required.")]
        public string? Password { get; set; }
    }
}
