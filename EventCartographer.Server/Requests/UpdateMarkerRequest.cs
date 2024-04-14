using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Requests
{
    public class UpdateMarkerRequest
    {
        [Required]
        public string Importance { get; set; }
        [Required]
        [StringLength(480, MinimumLength = 1)]
        public string Title { get; set; }
        [StringLength(5000)]
        public string? Description { get; set; }
        [Required]
        public DateTime StartsAt { get; set; }
    }
}
