using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class AddMarkerRequest
    {
        [Required(ErrorMessage = "http.request-errors.add-marker.latitude.required")]
        public decimal? Latitude { get; set; }
        [Required(ErrorMessage = "http.request-errors.add-marker.longitude.required")]
        public decimal? Longitude { get; set; }
        [Required(ErrorMessage = "http.request-errors.add-marker.importance.required")]
        public string? Importance { get; set; }
        [Required(ErrorMessage = "http.request-errors.add-marker.title.required")]
        [MaxLength(300, ErrorMessage = "http.request-errors.add-marker.title.max-length")]
        [MinLength(1, ErrorMessage = "http.request-errors.add-marker.title.min-length")]
        public string? Title { get; set; }
        [MaxLength(5000, ErrorMessage = "http.request-errors.add-marker.description.max-length")]
        public string? Description { get; set; }
        [Required(ErrorMessage = "http.request-errors.add-marker.starts-at.required")]
        public DateTime? StartsAt { get; set; }
    }
}
