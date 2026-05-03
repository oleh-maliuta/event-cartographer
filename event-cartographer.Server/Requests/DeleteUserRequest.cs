using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class DeleteUserRequest
    {
        [Required(ErrorMessage = "http.request-errors.delete-user.password.required")]
        public string? Password { get; set; }
    }
}
