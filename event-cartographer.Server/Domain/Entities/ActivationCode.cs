using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Domain.Entities;

public class ActivationCode
{
    [Key]
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
    [MaxLength(1000)]
    public string Action { get; set; }
    public DateTime ExpiresAt { get; set; }
}
