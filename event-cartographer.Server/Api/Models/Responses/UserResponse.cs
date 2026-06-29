using EventCartographer.Api.Common;
using EventCartographer.Domain.Entities;
using System.Text.Json.Serialization;

namespace EventCartographer.Api.Models.Responses;

public class UserResponse : BaseResponse
{
    public UserResponse(User data) : base(true, null, null)
    {
        Data = new View(data);
    }

    public UserResponse(ICollection<User> data) : base(true, null, null)
    {
        Data = data.Select(x => new View(x));
    }

    public class View(User user)
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = user.Name;
        [JsonPropertyName("permissionToDeletePastEvents")]
        public bool PermissionToDeletePastEvents { get; set; } = user.PermissionToDeletePastEvents;
        [JsonPropertyName("isActivated")]
        public bool IsActivated { get; set; } = user.IsActivated;
    }
}
