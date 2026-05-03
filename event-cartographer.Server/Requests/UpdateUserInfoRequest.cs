using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateUserInfoRequest
    {
        [Required(ErrorMessage = "http.request-errors.update-user-info.username.required")]
        [MaxLength(100, ErrorMessage = "http.request-errors.update-user-info.username.max-length")]
        [MinLength(3, ErrorMessage = "http.request-errors.update-user-info.username.min-length")]
        public string? Username { get; set; }
        [Required(ErrorMessage = "http.request-errors.update-user-info.permission-to-delete-past-events.required")]
        public bool? PermissionToDeletePastEvents { get; set; }
    }
}
