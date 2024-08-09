using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Models
{
    public class Marker
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        public User User { get; set; }
        [Required]
        [Precision(38, 20)]
        public decimal Latitude { get; set; }
        [Required]
        [Precision(38, 20)]
        public decimal Longitude { get; set; }
        [Required]
        [MaxLength(300)]
        public string Title { get; set; }
        [MaxLength(5000)]
        public string? Description { get; set; }
        [Required]
        [MaxLength(100)]
        public string Importance { get; set; }
        [Required]
        public DateTime StartsAt { get; set; }
    }
}
