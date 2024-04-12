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

        public UserResponse(ICollection<User> user) : base(true, null, null)
        {
            Data = user.Select(p => new View(p));
        }

        public class View
        {
            [JsonPropertyName("name")]
            public string Name { get; set; }

            public View(User user)
            {
                Name = user.Name;
            }
        }
    }
}
