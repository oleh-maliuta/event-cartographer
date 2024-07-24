using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateMarkerRequest
    {
        [Required(ErrorMessage = "A latitude value is required.")]
        public decimal? Latitude { get; set; }
        [Required(ErrorMessage = "A longitude value is required.")]
        public decimal? Longitude { get; set; }
        [Required(ErrorMessage = "An importance value is required.")]
        public string? Importance { get; set; }
        [Required(ErrorMessage = "A title is required.")]
        [StringLength(300, MinimumLength = 1)]
        [MaxLength(300, ErrorMessage = "Too long title.")]
        [MinLength(1, ErrorMessage = "Too short title.")]
        public string? Title { get; set; }
        [MaxLength(5000, ErrorMessage = "Too long description.")]
        public string? Description { get; set; }
        [Required(ErrorMessage = "A time of start is required.")]
        public DateTime? StartsAt { get; set; }
    }
}
