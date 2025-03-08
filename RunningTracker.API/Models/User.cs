using System.ComponentModel.DataAnnotations;

namespace RunningTracker.API.Models
{
    public class User : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? FirstName { get; set; }
        
        [StringLength(100)]
        public string? LastName { get; set; }
        
        public double? Weight { get; set; } // in kilograms
        
        public double? Height { get; set; } // in centimeters
        
        public DateTime? DateOfBirth { get; set; }
        
        public string? ProfilePictureUrl { get; set; }
        
        public ICollection<RunningActivity> RunningActivities { get; set; } = new List<RunningActivity>();
    }
} 