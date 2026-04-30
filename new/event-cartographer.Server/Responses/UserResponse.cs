using EventCartographer.Server.Models;
using System.Text.Json.Serialization;

namespace EventCartographer.Server.Responses
{
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

        public class View
        {
            [JsonPropertyName("name")]
            public string Name { get; set; }
            [JsonPropertyName("permissionToDeletePastEvents")]
            public bool PermissionToDeletePastEvents { get; set; }
            [JsonPropertyName("isActivated")]
            public bool IsActivated { get; set; }

            public View(User user)
            {
                Name = user.Name;
                PermissionToDeletePastEvents = user.PermissionToDeletePastEvents;
                IsActivated = user.IsActivated;
            }
        }
    }
}
