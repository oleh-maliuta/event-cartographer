using EventCartographer.Domain.Entities;
using System.Text.Json.Serialization;

namespace EventCartographer.Api.Models.Responses;

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

    public class View(Marker marker)
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = marker.Id.ToString("N");
        [JsonPropertyName("latitude")]
        public decimal Latitude { get; set; } = marker.Latitude;
        [JsonPropertyName("longitude")]
        public decimal Longitude { get; set; } = marker.Longitude;
        [JsonPropertyName("title")]
        public string Title { get; set; } = marker.Title;
        [JsonPropertyName("description")]
        public string? Description { get; set; } = marker.Description;
        [JsonPropertyName("importance")]
        public string Importance { get; set; } = marker.Importance;
        [JsonPropertyName("startsAt")]
        public DateTime StartsAt { get; set; } = marker.StartsAt;
    }

    public class ShortView(Marker marker)
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = marker.Id.ToString("N");
        [JsonPropertyName("latitude")]
        public decimal Latitude { get; set; } = marker.Latitude;
        [JsonPropertyName("longitude")]
        public decimal Longitude { get; set; } = marker.Longitude;
        [JsonPropertyName("importance")]
        public string Importance { get; set; } = marker.Importance;
    }
}
