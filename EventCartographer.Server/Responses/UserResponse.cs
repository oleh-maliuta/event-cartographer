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
            [JsonPropertyName("email")]
            public string Email { get; set; }
            [JsonPropertyName("isActivated")]
            public bool IsActivated { get; set; }

            public View(User user)
            {
                Name = user.Name;
                Email = user.Email;
                IsActivated = user.IsActivated;
            }
        }
    }
}
