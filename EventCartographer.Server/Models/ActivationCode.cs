using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Models
{
    public class ActivationCode
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        public User User { get; set; }
        [Required]
        [MaxLength(256)]
        public string Code { get; set; }
        [Required]
        [MaxLength(1000)]
        public string Action { get; set; }
        [Required]
        public DateTime ExpiresAt { get; set; }
    }
}
