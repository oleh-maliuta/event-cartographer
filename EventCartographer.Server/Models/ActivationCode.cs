using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Models
{
    public class ActivationCode
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        [MaxLength(256)]
        public string Code { get; set; }
        [MaxLength(1000)]
        public string Action { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
