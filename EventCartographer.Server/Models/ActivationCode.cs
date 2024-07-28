using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace EventCartographer.Server.Models
{
    public class ActivationCode
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("userId")]
        public string UserId { get; set; }
        [BsonElement("code")]
        public string Code { get; set; }
        [BsonElement("action")]
        public string Action { get; set; }
        [BsonElement("expiresAt")]
        public DateTime ExpiresAt { get; set; }
    }
}
