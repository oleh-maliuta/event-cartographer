using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EventCartographer.Server.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("email")]
        public string Email { get; set; }
        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; }
        [BsonElement("isActivated")]
        public bool IsActivated { get; set; }
        [BsonElement("lastActivityAt")]
        public DateTime LastActivityAt { get; set; }
    }
}
