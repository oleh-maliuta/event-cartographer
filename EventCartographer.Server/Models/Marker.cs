using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EventCartographer.Server.Models
{
    public class Marker
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("userId")]
        public Guid UserId { get; set; }

        [BsonElement("title")]
        public string Title { get; set; }
        [BsonElement("description")]
        public string Description { get; set; }
        [BsonElement("importance")]
        public string Importance { get; set; }
        [BsonElement("startsAt")]
        public DateTime StartsAt { get; set; }
    }
}
