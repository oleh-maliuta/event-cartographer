using EventCartographer.Server.Models;
using System.Text.Json.Serialization;

namespace EventCartographer.Server.Responses
{
    public class MarkerResponse : BaseResponse
    {
        public MarkerResponse(Marker data) : base(true, null, null)
        {
            Data = new View(data);
        }

        public MarkerResponse(ICollection<Marker> data) : base(true, null, null)
        {
            Data = data.Select(x => new View(x));
        }

        public class View
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }
            [JsonPropertyName("latitude")]
            public decimal Latitude { get; set; }
            [JsonPropertyName("longitude")]
            public decimal Longitude { get; set; }
            [JsonPropertyName("title")]
            public string Title { get; set; }
            [JsonPropertyName("description")]
            public string? Description { get; set; }
            [JsonPropertyName("importance")]
            public string Importance { get; set; }
            [JsonPropertyName("startsAt")]
            public DateTime StartsAt { get; set; }

            public View(Marker marker)
            {
                Id = marker.Id;
                Latitude = marker.Latitude;
                Longitude = marker.Longitude;
                Title = marker.Title;
                Description = marker.Description;
                Importance = marker.Importance;
                StartsAt = marker.StartsAt;
            }
        }

        public class ShortView
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }
            [JsonPropertyName("latitude")]
            public decimal Latitude { get; set; }
            [JsonPropertyName("longitude")]
            public decimal Longitude { get; set; }
            [JsonPropertyName("importance")]
            public string Importance { get; set; }

            public ShortView(Marker marker)
            {
                Id = marker.Id;
                Latitude = marker.Latitude;
                Longitude = marker.Longitude;
                Importance = marker.Importance;
            }
        }
    }
}
