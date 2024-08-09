using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [Required]
        [MaxLength(320)]
        public string Email { get; set; }
        [Required]
        public string PasswordHash { get; set; }
        [Required]
        public bool IsActivated { get; set; }
        [Required]
        public DateTime LastActivityAt { get; set; }

        public ICollection<ActivationCode> ActivationCodes { get; set; } = [];
        public ICollection<Marker> Markers { get; set; } = [];
    }
}
