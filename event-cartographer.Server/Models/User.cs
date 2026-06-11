using System.ComponentModel.DataAnnotations;

namespace EventCartographer.Server.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }
    [MaxLength(100)]
    public string Name { get; set; }
    [MaxLength(320)]
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public bool PermissionToDeletePastEvents { get; set; }
    public bool IsActivated { get; set; }
    public DateTime LastActivityAt { get; set; }

    public ICollection<ActivationCode> ActivationCodes { get; set; } = [];
    public ICollection<Marker> Markers { get; set; } = [];
}
