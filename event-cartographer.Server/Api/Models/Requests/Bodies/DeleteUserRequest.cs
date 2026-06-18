using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Api.Models.Requests.Bodies;

public class DeleteUserRequest
{
    [Required(ErrorMessage = "http.request-errors.delete-user.password.required")]
    public string? Password { get; set; }
}
